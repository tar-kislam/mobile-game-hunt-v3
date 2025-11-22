// Test script to open site tour popup immediately
// Run this in browser console or add to a page temporarily

if (typeof window !== 'undefined') {
  // Clear site tour popup localStorage
  localStorage.removeItem('mgh_site_tour_last_shown');
  localStorage.removeItem('mgh_site_tour_dismissed');
  
  // Trigger popup via custom event
  window.dispatchEvent(new CustomEvent('site-tour:open'));
  
  console.log('Site tour popup should open now. If not, refresh the page.');
}




