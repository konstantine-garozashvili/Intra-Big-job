# Lazy Loading Implementation Guide

This guide explains how to implement lazy loading in your React components to optimize performance by only fetching data when it's actually needed.

## Available Hooks

We've created three custom hooks to handle different lazy loading scenarios:

1. **useDataFetching**: For manual control over when data is fetched
2. **useVisibilityFetch**: For loading data when a component becomes visible
3. **useInteractionFetch**: For loading data when a user interaction occurs

## Usage Examples

### 1. Manual Data Fetching (useDataFetching)

Use this when you want full control over when data is fetched.

```jsx
import { useDataFetching } from '@/hooks/useDataFetching';
import { profileService } from '@/lib/services/profileService';

const ProfileComponent = () => {
  // Don't load on mount, fetch manually when needed
  const { data, loading, error, fetchData, hasLoaded } = useDataFetching(
    profileService.getAllProfileData,
    { loadOnMount: false }
  );

  // Only fetch data when it's needed
  useEffect(() => {
    // Example: Only fetch when a certain condition is met
    if (someCondition && !hasLoaded) {
      fetchData();
    }
  }, [someCondition, hasLoaded, fetchData]);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data && !loading) return <Button onClick={fetchData}>Load Profile</Button>;

  return (
    <div>
      {/* Render your component with data */}
      <h1>{data.name}</h1>
    </div>
  );
};
```

### 2. Visibility-Based Loading (useVisibilityFetch)

Use this to load data only when a component scrolls into view.

```jsx
import { useVisibilityFetch } from '@/hooks/useDataFetching';
import { documentService } from '@/lib/services/documentService';

const DocumentSection = () => {
  const { 
    data, 
    loading, 
    error, 
    elementRef, 
    isVisible 
  } = useVisibilityFetch(documentService.getDocuments);

  return (
    <div ref={elementRef} className="document-section">
      {loading && <Spinner />}
      {error && <ErrorMessage message={error.message} />}
      {data && (
        <ul>
          {data.map(doc => (
            <li key={doc.id}>{doc.name}</li>
          ))}
        </ul>
      )}
      {!data && !loading && !error && <Placeholder height="200px" />}
    </div>
  );
};
```

### 3. Interaction-Based Loading (useInteractionFetch)

Use this when data should only be loaded after a specific user interaction.

```jsx
import { useInteractionFetch } from '@/hooks/useDataFetching';
import { analyticsService } from '@/lib/services/analyticsService';

const AnalyticsPanel = () => {
  const { 
    data, 
    loading, 
    error, 
    fetchData 
  } = useInteractionFetch(analyticsService.getDetailedStats);

  return (
    <div className="analytics-panel">
      <h2>Analytics Dashboard</h2>
      
      {!data && !loading && (
        <Button onClick={() => fetchData()}>
          Load Analytics Data
        </Button>
      )}
      
      {loading && <Spinner />}
      
      {error && (
        <ErrorAlert message="Failed to load analytics data" />
      )}
      
      {data && (
        <AnalyticsChart data={data} />
      )}
    </div>
  );
};
```

## Refactoring Existing Components

To refactor existing components that load data on mount, follow these steps:

1. Identify components that fetch data in a `useEffect` hook on mount
2. Determine the appropriate lazy loading strategy:
   - If the data is crucial for the initial view, continue loading on mount
   - If the data is for a section lower on the page, use visibility-based loading
   - If the data is only needed after user interaction, use interaction-based loading
3. Replace the existing data fetching code with the appropriate hook

### Before (Loading on Mount)

```jsx
const ExampleComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await someService.getData();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Component render...
};
```

### After (Lazy Loading)

```jsx
import { useVisibilityFetch } from '@/hooks/useDataFetching';

const ExampleComponent = () => {
  const { data, loading, error, elementRef } = useVisibilityFetch(someService.getData);

  return (
    <div ref={elementRef}>
      {/* Component render... */}
    </div>
  );
};
```

## Best Practices

1. **Choose the right hook**: Match the lazy loading approach to the component's purpose
2. **Handle loading states gracefully**: Show appropriate placeholders or loading indicators
3. **Manage dependencies carefully**: Ensure your dependency arrays are correctly specified
4. **Consider data persistence**: For frequently accessed data, consider caching strategies
5. **Implement error handling**: Always handle possible error states in your UI

By implementing these lazy loading patterns, you'll significantly improve your application's performance by reducing unnecessary data fetching and rendering. 