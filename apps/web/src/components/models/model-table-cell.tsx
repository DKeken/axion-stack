import React from 'react';

import { Button, Chip, Avatar, getKeyValue } from '@heroui/react';

import { STATUS_COLOR_MAP, CAPABILITY_ICONS, MAX_CAPABILITIES_DISPLAY } from './constants';
import { formatContextLength, formatModelCostPer1M, getModelInitials } from './utils';

import type { ModelData } from './types';

interface ModelTableCellProps {
  model: ModelData;
  columnKey: string | number;
  selectedModelId?: string;
  onModelSelect?: (modelId: string) => void;
}

export function ModelTableCell({
  model,
  columnKey,
  selectedModelId,
  onModelSelect,
}: ModelTableCellProps) {
  const cellValue = getKeyValue(model, columnKey);

  switch (columnKey) {
    case 'name':
      return (
        <div className='flex items-center gap-3'>
          <Avatar
            size='sm'
            name={getModelInitials(model.name, model.provider?.name ?? model.providerId)}
            className='w-8 h-8 text-xs'
          />
          <div>
            <p className='font-medium'>{model.name}</p>
            {model.description && (
              <p className='text-xs text-foreground-500 truncate max-w-48'>{model.description}</p>
            )}
          </div>
        </div>
      );

    case 'provider':
      return <span className='text-sm'>{model.provider?.name ?? model.providerId}</span>;

    case 'capabilities':
      return (
        <div className='flex flex-wrap gap-1'>
          {model.capabilities?.slice(0, MAX_CAPABILITIES_DISPLAY).map((capability) => (
            <Chip
              key={capability}
              size='sm'
              variant='flat'
              className='text-xs'
              startContent={
                <span className='text-xs'>
                  {CAPABILITY_ICONS[capability as keyof typeof CAPABILITY_ICONS] ?? '⚡'}
                </span>
              }
            >
              {capability}
            </Chip>
          ))}
          {model.capabilities && model.capabilities.length > MAX_CAPABILITIES_DISPLAY && (
            <Chip size='sm' variant='flat' className='text-xs'>
              +{model.capabilities.length - MAX_CAPABILITIES_DISPLAY}
            </Chip>
          )}
        </div>
      );

    case 'contextLength':
      return <span className='text-sm'>{formatContextLength(model.contextLength)}</span>;

    case 'cost':
      return (
        <div className='text-sm'>
          {model.isFree ? (
            <Chip size='sm' color='success' variant='flat'>
              Free
            </Chip>
          ) : (
            <div className='space-y-1'>
              {model.ourInputPricePer1k && (
                <div className='text-xs'>
                  In: {formatModelCostPer1M(model.ourInputPricePer1k)}/1M
                </div>
              )}
              {model.ourOutputPricePer1k && (
                <div className='text-xs'>
                  Out: {formatModelCostPer1M(model.ourOutputPricePer1k)}/1M
                </div>
              )}
              {!model.ourInputPricePer1k && !model.ourOutputPricePer1k && (
                <div className='text-xs text-foreground-400'>—</div>
              )}
            </div>
          )}
        </div>
      );

    case 'status':
      return (
        <Chip size='sm' color={STATUS_COLOR_MAP[model.status] ?? 'default'} variant='flat'>
          {model.status}
        </Chip>
      );

    case 'actions':
      return (
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant={selectedModelId === model.id ? 'solid' : 'bordered'}
            color={selectedModelId === model.id ? 'primary' : 'default'}
            onPress={() => onModelSelect?.(model.id)}
          >
            {selectedModelId === model.id ? 'Selected' : 'Select'}
          </Button>
        </div>
      );

    default:
      return String(cellValue ?? '');
  }
}
