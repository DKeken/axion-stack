import { useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Skeleton,
} from '@heroui/react';
import { FiSearch, FiZap, FiGrid, FiCheck } from 'react-icons/fi';

import { ICON_SIZES, MODEL_LIMITS } from './constants';
import { useModels, useModelSelection, useBreakpoints } from './hooks';
import { ModelRegistry, ModelRegistryPagination } from './model-registry';
import { getModelInitials, isModelFree } from './utils';

import type { ModelPaletteProps } from './types';

export function ModelPalette({
  className,
  variant = 'minimal',
  onModelSelect,
  selectedModelId: externalSelectedModelId,
}: ModelPaletteProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');

  // Используем хуки для управления состоянием
  const { models, isLoading } = useModels('palette');
  const { selectedModelId, selectModel } = useModelSelection();
  const { isMobile, isTablet } = useBreakpoints();

  // Используем внешний selectedModelId если он передан
  const currentSelectedModelId = externalSelectedModelId ?? selectedModelId;

  const handleModelSelect = (modelId: string) => {
    selectModel(modelId);
    onModelSelect?.(modelId);
  };

  if (variant === 'minimal') {
    return (
      <>
        <Card className={`${className} shadow-sm border-default-200`}>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center gap-2'>
                <FiZap size={ICON_SIZES.small} />
                <h3 className='font-medium text-sm text-foreground'>Models</h3>
              </div>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onPress={onOpen}
                aria-label='Open model registry'
              >
                <FiGrid size={ICON_SIZES.medium} />
              </Button>
            </div>
          </CardHeader>
          <CardBody className='pt-0 space-y-2'>
            <div className={`space-y-0.5 overflow-y-auto ${isMobile ? 'max-h-24' : 'max-h-32'}`}>
              {isLoading
                ? // Skeleton загрузка
                  Array.from({ length: isMobile ? 2 : 3 }, (_, i) => `skeleton-${i}`).map((id) => (
                    <div key={id} className='flex items-center gap-1.5 p-1'>
                      <Skeleton className='w-3 h-3 rounded' />
                      <Skeleton className='h-2.5 w-16' />
                    </div>
                  ))
                : models
                    .slice(0, isMobile ? MODEL_LIMITS.minimalMobile : MODEL_LIMITS.minimal)
                    .map((model) => (
                      <div
                        key={model.id}
                        className={`
                            flex items-center gap-1.5 p-1 rounded cursor-pointer transition-colors text-xs
                            hover:bg-default-100
                            ${
                              currentSelectedModelId === model.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-default-50'
                            }
                          `}
                        onClick={() => handleModelSelect(model.id)}
                      >
                        <div className='w-3 h-3 rounded bg-content2 flex items-center justify-center text-[8px] font-bold text-content2-foreground'>
                          {getModelInitials(model.name, model.providerId).slice(0, 1)}
                        </div>

                        <div className='flex-1 min-w-0 flex items-center gap-1'>
                          <span className='font-medium text-[11px] truncate leading-tight'>
                            {model.name}
                          </span>
                          {isModelFree(model) && (
                            <div className='w-1 h-1 rounded-full bg-success shrink-0' />
                          )}
                        </div>

                        {currentSelectedModelId === model.id && (
                          <div className='text-primary shrink-0'>
                            <FiCheck size={ICON_SIZES.small} />
                          </div>
                        )}
                      </div>
                    ))}
            </div>

            <Button
              size='sm'
              variant='light'
              fullWidth
              startContent={<FiGrid size={ICON_SIZES.small + 2} />}
              onPress={onOpen}
              className={isMobile ? 'text-xs h-8' : ''}
            >
              {isMobile ? 'All Models' : 'Browse All'}
            </Button>
          </CardBody>
        </Card>

        {isMobile || isTablet ? (
          <Drawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement='bottom'
            className='max-h-[85vh]'
          >
            <DrawerContent className='flex flex-col h-full'>
              {(onClose) => (
                <>
                  <DrawerHeader className='flex flex-col gap-1 shrink-0 pb-2'>
                    <h3 className='text-lg font-semibold'>Model Registry</h3>
                    <p className='text-sm text-foreground-500'>
                      Browse and select from all available AI models
                    </p>
                  </DrawerHeader>
                  <DrawerBody className='px-0 flex-1 overflow-hidden'>
                    <ModelRegistry
                      onModelSelect={(modelId) => {
                        handleModelSelect(modelId);
                        onClose();
                      }}
                      selectedModelId={currentSelectedModelId}
                      externalPagination
                    />
                  </DrawerBody>
                  <DrawerFooter className='shrink-0 px-0 pb-0'>
                    <ModelRegistryPagination />
                  </DrawerFooter>
                </>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size='5xl'
            scrollBehavior='inside'
            className='max-h-[90vh]'
          >
            <ModalContent className='flex flex-col h-full'>
              {(onClose) => (
                <>
                  <ModalHeader className='flex flex-col gap-1 shrink-0'>
                    <h3 className='text-lg font-semibold'>Model Registry</h3>
                    <p className='text-sm text-foreground-500'>
                      Browse and select from all available AI models
                    </p>
                  </ModalHeader>
                  <ModalBody className='px-0 flex-1 overflow-hidden'>
                    <ModelRegistry
                      onModelSelect={(modelId) => {
                        handleModelSelect(modelId);
                        onClose();
                      }}
                      selectedModelId={currentSelectedModelId}
                      externalPagination
                    />
                  </ModalBody>
                  <ModalFooter className='shrink-0 px-0 pb-0'>
                    <ModelRegistryPagination />
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        )}
      </>
    );
  }

  // Expanded version for dedicated pages
  return (
    <div className={className}>
      <Card>
        <CardHeader className={isMobile ? 'pb-2' : 'pb-4'}>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-2'>
              <FiZap size={isMobile ? ICON_SIZES.large : ICON_SIZES.xxlarge} />
              <div>
                <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Model Palette
                </h2>
                {!isMobile && (
                  <p className='text-sm text-foreground-500'>Select and configure AI models</p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className={isMobile ? 'space-y-3' : 'space-y-4'}>
          {!isMobile && (
            <div className='flex gap-3'>
              <Input
                aria-label='Search models'
                placeholder='Search models...'
                startContent={<FiSearch size={ICON_SIZES.xlarge} />}
                className='flex-1'
                variant='bordered'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            </div>
          )}

          <ModelRegistry
            onModelSelect={handleModelSelect}
            selectedModelId={currentSelectedModelId}
            searchQuery={searchQuery}
          />
        </CardBody>
      </Card>
    </div>
  );
}
