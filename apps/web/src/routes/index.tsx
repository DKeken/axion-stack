import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>TanStack Query Demo</h1>
          <p className='text-xl text-gray-600 mb-8'>
            Full-stack type-safe application with React Query
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Features Card */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Features</h2>
            <ul className='space-y-3 text-gray-600'>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3' />
                TanStack Query v5 for data fetching
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3' />
                TypeScript end-to-end type safety
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3' />
                ts-rest for API contracts
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3' />
                TanStack Router for navigation
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-green-500 rounded-full mr-3' />
                React Query Devtools
              </li>
            </ul>
          </div>

          {/* Quick Start Card */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Quick Start</h2>
            <div className='space-y-4'>
              <a
                href='/users'
                className='block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors'
              >
                View Users Demo
              </a>
              <div className='text-sm text-gray-600'>
                <p className='mb-2'>Available API endpoints:</p>
                <ul className='space-y-1 text-xs font-mono bg-gray-50 p-3 rounded'>
                  <li>GET /api/v1/users</li>
                  <li>GET /api/v1/users/:id</li>
                  <li>POST /api/v1/users</li>
                  <li>PATCH /api/v1/users/:id</li>
                  <li>DELETE /api/v1/users/:id</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className='mt-12 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>Developer Tools</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-medium text-gray-800 mb-2'>React Query Devtools</h3>
              <p className='text-gray-600 text-sm'>
                Check the bottom-left corner for the React Query devtools button. Use it to inspect
                cache, queries, and mutations.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-medium text-gray-800 mb-2'>TanStack Router Devtools</h3>
              <p className='text-gray-600 text-sm'>
                Check the bottom-right corner for the Router devtools. Use it to inspect routes,
                route tree, and navigation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
