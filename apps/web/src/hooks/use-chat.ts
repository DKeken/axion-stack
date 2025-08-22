import { useCallback, useEffect, useRef } from 'react';

import { MessageRoleSchema, MessageStatusSchema } from '@repo/database/generated/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ChatMessageResponse,
  CreateChatThreadDto,
  CreateChatMessageDto,
  ChatThreadListQuery,
  ChatMessageListQuery,
  ChatStreamEvent,
} from '@repo/contracts';

import { apiClient } from '~/lib/api-client';
import { useChatStore } from '~/stores/chat-store';

// Threads hooks
export function useChatThreads(query?: Partial<ChatThreadListQuery>) {
  const queryClient = useQueryClient();

  const queryParams = {
    limit: 50,
    sort: ['lastMessageAt:desc'],
    ...query,
  };

  return useQuery({
    queryKey: ['chat', 'threads', queryParams],
    queryFn: async () => {
      const result = await apiClient.chats.threads.list.query({ query: queryParams });
      if (result.status !== 200) {
        throw new Error('Failed to fetch threads');
      }
      return result.body;
    },
    enabled: Boolean(queryClient),
  });
}

export function useChatThread(threadId?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['chat', 'thread', threadId],
    queryFn: async () => {
      if (!threadId) return null;
      const result = await apiClient.chats.threads.getById.query({ params: { id: threadId } });
      if (result.status !== 200) {
        throw new Error('Failed to fetch thread');
      }
      return result.body;
    },
    enabled: Boolean(threadId && queryClient),
  });
}

export function useCreateChatThread() {
  const queryClient = useQueryClient();
  const { setCurrentThread } = useChatStore();

  return useMutation({
    mutationFn: async (data: CreateChatThreadDto) => {
      const result = await apiClient.chats.threads.create.mutation({ body: data });
      if (result.status !== 201) {
        throw new Error('Failed to create thread');
      }
      return result.body;
    },
    onSuccess: (thread) => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
      setCurrentThread(thread);
    },
  });
}

export function useDeleteChatThread() {
  const queryClient = useQueryClient();
  const { currentThreadId, clearCurrentThread } = useChatStore();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const result = await apiClient.chats.threads.delete.mutation({ params: { id: threadId } });
      if (result.status !== 204) {
        throw new Error('Failed to delete thread');
      }
    },
    onSuccess: (_, threadId) => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
      void queryClient.removeQueries({ queryKey: ['chat', 'thread', threadId] });
      void queryClient.removeQueries({ queryKey: ['chat', 'messages', threadId] });

      // Clear current thread if it was deleted
      if (currentThreadId === threadId) {
        clearCurrentThread();
      }
    },
  });
}

// Messages hooks
export function useChatMessages(threadId?: string, query?: Partial<ChatMessageListQuery>) {
  const queryClient = useQueryClient();

  const queryParams = {
    limit: 100,
    sort: ['messageIndex:asc'],
    ...query,
  };

  return useQuery({
    queryKey: ['chat', 'messages', threadId, queryParams],
    queryFn: async () => {
      if (!threadId) return null;
      const result = await apiClient.chats.messages.list.query({
        params: { threadId, id: threadId },
        query: queryParams,
      });
      if (result.status !== 200) {
        throw new Error('Failed to fetch messages');
      }
      return result.body;
    },
    enabled: Boolean(threadId && queryClient),
  });
}

export function useCreateChatMessage() {
  const queryClient = useQueryClient();
  const { currentThreadId, addMessage, setSendingMessage } = useChatStore();

  return useMutation({
    mutationFn: async ({ threadId, data }: { threadId: string; data: CreateChatMessageDto }) => {
      setSendingMessage(true);
      const result = await apiClient.chats.messages.create.mutation({
        params: { threadId, id: threadId },
        body: data,
      });
      if (result.status !== 201) {
        throw new Error('Failed to create message');
      }
      return result.body;
    },
    onSuccess: (message, { threadId }) => {
      void queryClient.invalidateQueries({ queryKey: ['chat', 'messages', threadId] });
      void queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
      void queryClient.invalidateQueries({ queryKey: ['chat', 'thread', threadId] });

      if (threadId === currentThreadId) {
        addMessage(message);
      }
    },
    onSettled: () => {
      setSendingMessage(false);
    },
  });
}

// Streaming hook
export function useChatStreaming() {
  const {
    currentThreadId,
    startStreaming,
    appendStreamContent,
    finishStreaming,
    streaming,
    addMessage,
  } = useChatStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  const sendStreamingMessage = useCallback(
    async (data: CreateChatMessageDto) => {
      if (!currentThreadId) {
        throw new Error('No current thread');
      }

      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Add user message immediately
      const userMessage: ChatMessageResponse = {
        id: `temp-${Date.now()}`,
        threadId: currentThreadId,
        role: data.role,
        content: data.content,
        status: MessageStatusSchema.enum.COMPLETED,
        messageIndex: 0, // Will be updated by server
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modelId: data.modelId,
        parentId: data.parentId ?? null,
        inputTokens: null,
        outputTokens: null,
        cost: null,
        latencyMs: null,
        retryCount: 0,
        hasEvidence: false,
        evidenceCoverage: null,
        functionCalls: null,
        toolCalls: null,
      };

      addMessage(userMessage);

      // Start streaming
      startStreaming();

      try {
        // Make the POST request to start streaming
        const response = await fetch(`/api/v1/chats/threads/${currentThreadId}/messages/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to start streaming');
        }

        // Set up EventSource for the stream
        const eventSource = new EventSource(
          `/api/v1/chats/threads/${currentThreadId}/messages/stream`
        );
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const streamEvent: ChatStreamEvent = JSON.parse(event.data);

            switch (streamEvent.type) {
              case 'content':
                if (streamEvent.data) {
                  appendStreamContent(streamEvent.data);
                }
                break;

              case 'done':
                // Stream completed, we should get the final message
                if (streamEvent.data) {
                  try {
                    const finalMessage: ChatMessageResponse = JSON.parse(streamEvent.data);
                    finishStreaming(finalMessage);
                  } catch {
                    finishStreaming();
                  }
                } else {
                  finishStreaming();
                }

                // Invalidate queries to refresh data
                void queryClient.invalidateQueries({
                  queryKey: ['chat', 'messages', currentThreadId],
                });
                void queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
                break;

              case 'error':
                console.error('Streaming error:', streamEvent.error);
                finishStreaming();
                break;
            }
          } catch (error) {
            console.error('Failed to parse stream event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          finishStreaming();
          eventSource.close();
        };
      } catch (error) {
        console.error('Failed to start streaming:', error);
        finishStreaming();
        throw error;
      }
    },
    [currentThreadId, startStreaming, appendStreamContent, finishStreaming, addMessage, queryClient]
  );

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    finishStreaming();
  }, [finishStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    sendStreamingMessage,
    stopStreaming,
    isStreaming: streaming.isStreaming,
    currentContent: streaming.currentContent,
  };
}

// Combined hook for easy chat management
export function useChat() {
  const {
    currentThreadId,
    currentThread,
    messages,
    settings,
    setCurrentThread,
    clearCurrentThread,
    setMessages,
  } = useChatStore();

  const threadsQuery = useChatThreads();
  const threadQuery = useChatThread(currentThreadId);
  const messagesQuery = useChatMessages(currentThreadId);

  const createThread = useCreateChatThread();
  const deleteThread = useDeleteChatThread();
  const createMessage = useCreateChatMessage();
  const streaming = useChatStreaming();

  // Sync store with server data
  useEffect(() => {
    if (threadQuery.data && threadQuery.data.id === currentThreadId) {
      setCurrentThread(threadQuery.data);
    }
  }, [threadQuery.data, currentThreadId, setCurrentThread]);

  useEffect(() => {
    if (messagesQuery.data?.items && currentThreadId) {
      setMessages(messagesQuery.data.items);
    }
  }, [messagesQuery.data, currentThreadId, setMessages]);

  const sendMessage = useCallback(
    async (content: string, useStreaming = true): Promise<void> => {
      if (!currentThreadId) {
        // Create a new thread first
        await createThread.mutateAsync({
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          tags: [],
          contextVaultFiles: [],
          isPrivate: false,
        });

        // Thread will be set as current by the mutation's onSuccess
      }

      const messageData: CreateChatMessageDto = {
        role: MessageRoleSchema.enum.USER,
        threadId: currentThreadId!,
        content,
        functionCalls: null,
        toolCalls: null,
        modelId: settings.selectedModelId,
        status: MessageStatusSchema.enum.PENDING,
      };

      if (useStreaming) {
        await streaming.sendStreamingMessage(messageData);
      } else {
        await createMessage.mutateAsync({
          threadId: currentThreadId!,
          data: messageData,
        });
      }
    },
    [currentThreadId, settings.selectedModelId, createThread, createMessage, streaming]
  );

  return {
    // State
    currentThreadId,
    currentThread,
    messages,
    settings,

    // Queries
    threads: threadsQuery.data?.items ?? [],
    isLoadingThreads: threadsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,

    // Actions
    setCurrentThread,
    clearCurrentThread,
    sendMessage,
    deleteThread: deleteThread.mutate,

    // Streaming
    ...streaming,

    // Loading states
    isCreatingThread: createThread.isPending,
    isSendingMessage: createMessage.isPending,
    isDeletingThread: deleteThread.isPending,
  };
}
