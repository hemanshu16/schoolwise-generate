# Loading State Implementation Guide

This guide explains how to implement loading states throughout the application for consistency.

## Basic Loading Pattern

For any async operation that requires user feedback:

1. Create a loading state variable:
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   ```

2. Wrap your async operation:
   ```typescript
   const handleSubmit = async () => {
     try {
       setIsLoading(true);
       await someAsyncOperation();
     } catch (error) {
       // Error handling
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. Use loading state in your UI:
   ```jsx
   <Button 
     disabled={isLoading}
     onClick={handleSubmit}
   >
     {isLoading ? (
       <>
         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
         Loading...
       </>
     ) : (
       "Submit"
     )}
   </Button>
   ```

## Components with Loading Support

The following components have built-in loading support:

### ExamNameInputContent

```jsx
<ExamNameInputContent
  onSubmit={handleSubmit}
  onClose={handleClose}
  isLoading={isLoading}
  loadingText="Custom loading message"
/>
```

### SchoolList

The SchoolList component shows loading states for report generation.

## Toast-Based Loading

For non-blocking operations, use toast notifications:

```typescript
const handleOperation = async () => {
  toast.loading("Operation in progress...", { id: "operation-toast" });
  
  try {
    await someAsyncOperation();
    toast.dismiss("operation-toast");
    toast.success("Operation completed");
  } catch (error) {
    toast.dismiss("operation-toast");
    toast.error("Operation failed");
  }
};
```

## Best Practices

1. Always provide visual feedback for operations that take more than 300ms
2. Disable interactive elements during loading states
3. Use toast for background operations that don't block the UI
4. Use inline loaders for operations that prevent further interaction
5. Include meaningful loading text that indicates what's happening

## Implementation Examples

### Download Excel Files

```typescript
import * as XLSX from 'xlsx';

const handleDownload = async () => {
  setIsDownloading(true);
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet format
    const worksheetData = [
      ["Header1", "Header2"], // Header row
      ...data.map(item => [item.field1, item.field2]) // Data rows
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 30 }, // Column A width
      { wch: 50 }  // Column B width
    ];
    
    // Apply column widths
    ws['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet Name");
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filename.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Download complete");
  } catch (error) {
    toast.error("Download failed");
  } finally {
    setIsDownloading(false);
  }
};
```

### Form Submissions

```typescript
const handleSubmit = async (data) => {
  setIsSubmitting(true);
  
  try {
    await submitForm(data);
    toast.success("Form submitted");
  } catch (error) {
    toast.error("Submission failed");
  } finally {
    setIsSubmitting(false);
  }
};
``` 