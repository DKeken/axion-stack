import * as React from 'react';

import { Badge, Button, Input, Spinner } from './ui';

export function WebTUIDemo() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      setIsLoading(false);
      setInputValue('');
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '42rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>WebTUI Demo</h1>
        <p>Terminal-style UI components in action</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Badge variant='foreground0'>Default</Badge>
          <Badge variant='red'>Error</Badge>
          <Badge variant='green'>Success</Badge>
          <Badge variant='yellow'>Warning</Badge>
          <Badge variant='blue'>Info</Badge>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant='foreground0'>Primary</Button>
          <Button variant='foreground1'>Secondary</Button>
          <Button variant='red'>Danger</Button>
          <Button variant='green'>Success</Button>
          <Button variant='blue'>Info</Button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Form</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Input
              type='text'
              placeholder='Enter some text...'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <Button type='submit' disabled={isLoading} variant='foreground0'>
            {isLoading ? 'Processing...' : 'Submit'}
          </Button>
        </form>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Loading State</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Spinner />
          <span>Loading...</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Code Block</h2>
        <pre style={{ 
          backgroundColor: 'var(--background1)', 
          padding: '1rem', 
          marginTop: '1rem',
          overflow: 'auto' 
        }}>
{`// WebTUI Components Example
import { Button, Badge, Input } from '~/components/ui';

export function MyComponent() {
  return (
    <div>
      <Badge variant="green">Status: Online</Badge>
      <Button variant="foreground0">Click me</Button>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}