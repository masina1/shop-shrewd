// Test the improved slugifyCategory function
function slugifyCategory(category) {
  return category
    .toLowerCase()
    // Replace Romanian diacritics with their ASCII equivalents
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a') 
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    // Replace spaces and special characters with hyphens
    .replace(/[\s&+%20,]/g, '-')
    // Keep only lowercase letters, numbers, and hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

// Test with your examples
const testCases = [
  'Apa-si-sucuri',
  'Sucuri', 
  'Carbogazoase',
  'Apa-carbogazoasa',
  'Apa-plata'
];

console.log('=== Testing Improved slugifyCategory ===');
testCases.forEach(test => {
  const result = slugifyCategory(test);
  console.log(`${test} → ${result}`);
});

// Test with the actual URL path
const urlPath = 'Apa-si-sucuri/Sucuri/Carbogazoase';
const extracted = urlPath.split('/')[0]; // First part
const slugged = slugifyCategory(extracted);
console.log(`\nURL Path: ${urlPath}`);
console.log(`Extracted: ${extracted}`);
console.log(`Slugged: ${slugged}`);
