// Image modal functionality for detalle-cotizacion.html
document.addEventListener('DOMContentLoaded', () => {
    
    // Image storage and management
    let lastDeletedImage = null;
    let uploadedImages = [];
    let currentSelectedImageUrl = null;
    let currentProductRow = null; // Track which product row is being edited
    let currentUploadArea = null; // Track the current upload area element
    
    // Multi-select functionality
    let multiSelectMode = false;
    let selectedImages = []; // Array to store up to 3 selected images in order
    
    // Load saved images from localStorage
    function loadSavedImages() {
      const savedImages = sessionStorage.getItem('uploadedImages');
      if (savedImages) {
        uploadedImages = JSON.parse(savedImages);
        renderUploadedImages();
      }
    }
    
    // Save images to localStorage
    function saveImages() {
      sessionStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
    }
    
    // Handle files (used by both file upload and clipboard paste)
    function handleFiles(files) {
      if (files && files.length > 0) {
        const newImages = [];
        const totalFiles = files.length;
        let processedFiles = 0;
        
        Array.from(files).forEach(file => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
              const imageUrl = event.target.result;
              newImages.push({ url: imageUrl });
              processedFiles++;
              
              if (processedFiles === totalFiles) {
                uploadedImages = [...uploadedImages, ...newImages];
                saveImages();
                renderUploadedImages();
              }
            };
            reader.readAsDataURL(file);
          } else {
            processedFiles++;
          }
        });
      }
    }
    
    // Clipboard paste functionality
    function handlePaste(e) {
        // Only handle paste events when the image modal is open
        const modal = document.getElementById('imageModal');
        if (!modal || modal.style.display !== 'flex') return;
        
        const clipboardData = e.clipboardData || window.clipboardData;
        const items = clipboardData.items;
        
        if (!items) return;
        
        const imageFiles = [];
        
        // Check all clipboard items for images
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Check if the item is an image
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }
        
        // If we found images, process them
        if (imageFiles.length > 0) {
            e.preventDefault(); // Prevent default paste behavior
            handleFiles(imageFiles);
        }
    }
    
    // Render uploaded images in the grid
    function renderUploadedImages() {
      if (!uploadedImagesGrid) return;
      
      // Find the current upload area (it might be in the modal)
      const uploadAreaElement = uploadedImagesGrid.querySelector('.upload-area');
      if (!uploadAreaElement) return;
      
      // Clear existing uploaded images (except the upload area)
      const uploadAreaClone = uploadAreaElement.cloneNode(true);
      uploadedImagesGrid.innerHTML = '';
      uploadedImagesGrid.appendChild(uploadAreaClone);
      
      // Re-setup drag and drop after rendering
      currentUploadArea = setupDragAndDrop();
      
      // Re-setup file input handler after rendering
      setupFileInputHandler();
      
      // Add each uploaded image
      uploadedImages.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.setAttribute('data-image', image.url);
        imageItem.setAttribute('data-type', 'uploaded');
        imageItem.setAttribute('data-id', `uploaded-${index}`);
        
        // Check if this is the currently selected image
        if (image.url === currentSelectedImageUrl) {
          imageItem.classList.add('selected-image');
        }
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = `Uploaded image ${index + 1}`;
        
        // Only add delete button for uploaded images
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-delete-btn';
        deleteBtn.innerHTML = '<i class="far fa-trash-alt"></i>';
        
        imageItem.appendChild(img);
        imageItem.appendChild(deleteBtn);
        uploadedImagesGrid.appendChild(imageItem);
        
        // Add click event to select image
        imageItem.addEventListener('click', (e) => {
          // Don't trigger selection if clicking delete button or badge
          if (e.target !== deleteBtn && 
              !deleteBtn.contains(e.target) && 
              !e.target.classList.contains('selection-number-badge')) {
            handleImageSelect(imageItem);
          }
        });
        
        // Add click event to delete button
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleImageDelete(imageItem);
        });
      });
    }
    
    // JS for image modal
    const imageModal = document.getElementById('imageModal');
    if (!imageModal) {
      console.warn('Image modal not found');
      return;
    }
    
    // Get elements scoped to the image modal
    const closeModalBtn = imageModal.querySelector('#closeModalBtn');
    const selectMultipleBtn = imageModal.querySelector('#selectMultipleBtn');
    const uploadedImagesGrid = imageModal.querySelector('#uploadedImagesGrid');
    const imageUploadInput = imageModal.querySelector('#imageUploadInput');
    const uploadArea = imageModal.querySelector('.upload-area');
    
    if (!closeModalBtn || !selectMultipleBtn || !uploadedImagesGrid || !imageUploadInput || !uploadArea) {
      console.warn('Image modal elements not found', {
        closeModalBtn: !!closeModalBtn,
        selectMultipleBtn: !!selectMultipleBtn,
        uploadedImagesGrid: !!uploadedImagesGrid,
        imageUploadInput: !!imageUploadInput,
        uploadArea: !!uploadArea
      });
      return;
    }
    
    // Load saved images when page loads
    loadSavedImages();
    
    // Attach paste handler after modal is defined
    document.addEventListener('paste', handlePaste, false);
    
    // Toggle multi-select mode
    selectMultipleBtn.addEventListener('click', () => {
      multiSelectMode = !multiSelectMode;
      
      if (multiSelectMode) {
        selectMultipleBtn.classList.add('active');
        selectMultipleBtn.innerHTML = '<i class="fas fa-check-square me-1"></i>Cancelar selección';
        // Clear single selection when entering multi-select mode
        document.querySelectorAll('.image-item').forEach(item => {
          item.classList.remove('selected-image');
        });
      } else {
        selectMultipleBtn.classList.remove('active');
        selectMultipleBtn.innerHTML = '<i class="fas fa-check-square me-1"></i>Seleccionar varias';
        // Clear multi-select selections
        selectedImages = [];
        updateMultiSelectDisplay();
        highlightSelectedImage();
      }
    });
    
    // Setup file input handler using event delegation on the modal
    function setupFileInputHandler() {
      // Use event delegation on the modal to catch file input changes
      // This way it works even when the upload area is recreated
      imageModal.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'imageUploadInput' && e.target.type === 'file') {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            // Reset the file input
            e.target.value = '';
          }
        }
      }, true); // Use capture phase to catch early
    }
    
    // Open modal when clicking on product images in the table
    function openImageModal(productImg, productRow) {
      currentProductRow = productRow;
      currentSelectedImageUrl = productImg.src;
      
      imageModal.style.display = 'flex';
      multiSelectMode = false;
      selectedImages = [];
      selectMultipleBtn.classList.remove('active');
      selectMultipleBtn.innerHTML = '<i class="fas fa-check-square me-1"></i>Seleccionar varias';
      highlightSelectedImage();
      updateMultiSelectDisplay();
      
      // Re-setup drag and drop when modal opens (in case upload area was recreated)
      currentUploadArea = setupDragAndDrop();
      
      // Re-setup file input handler
      setupFileInputHandler();
    }
    
    // Function to setup click handlers for product images
    function setupProductImageHandlers() {
      document.querySelectorAll('.product-image img.product-img').forEach(img => {
        // Make the image container clickable
        const productImageContainer = img.closest('.product-image');
        if (productImageContainer && !productImageContainer.classList.contains('clickable-image')) {
          productImageContainer.style.cursor = 'pointer';
          productImageContainer.classList.add('clickable-image');
          
          // Add hover icon if it doesn't exist
          if (!productImageContainer.querySelector('.image-hover-icon')) {
            const hoverIcon = document.createElement('i');
            hoverIcon.className = 'fas fa-image image-hover-icon';
            productImageContainer.appendChild(hoverIcon);
          }
          
          productImageContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productRow = img.closest('tr');
            openImageModal(img, productRow);
          });
        }
      });
    }
    
    // Initial setup
    setupProductImageHandlers();
    
    // Use MutationObserver to handle dynamically added product rows
    const tableObserver = new MutationObserver((mutations) => {
      setupProductImageHandlers();
    });
    
    const tableBody = document.querySelector('table tbody');
    if (tableBody) {
      tableObserver.observe(tableBody, {
        childList: true,
        subtree: true
      });
    }
    
    // Apply selected images and close modal
    function applySelectedImages() {
      if (!currentProductRow) return;
      
      const productImg = currentProductRow.querySelector('.product-img');
      if (!productImg) return;
      
      if (multiSelectMode && selectedImages.length > 0) {
        // Update product image to first selected image
        productImg.src = selectedImages[0].url;
        currentSelectedImageUrl = selectedImages[0].url;
        
        // Store all selected images for potential future use
        console.log('Selected images:', selectedImages.map(img => img.url));
      } else if (!multiSelectMode && currentSelectedImageUrl) {
        // Single select mode - already updated in handleImageSelect
        productImg.src = currentSelectedImageUrl;
      }
    }
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
      applySelectedImages();
      imageModal.style.display = 'none';
      // Reset multi-select mode when closing
      multiSelectMode = false;
      selectedImages = [];
      selectMultipleBtn.classList.remove('active');
      selectMultipleBtn.innerHTML = '<i class="fas fa-check-square me-1"></i>Seleccionar varias';
      currentProductRow = null;
    });
    
    // Close modal when clicking outside
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        applySelectedImages();
        imageModal.style.display = 'none';
        // Reset multi-select mode when closing
        multiSelectMode = false;
        selectedImages = [];
        selectMultipleBtn.classList.remove('active');
        selectMultipleBtn.innerHTML = '<i class="fas fa-check-square me-1"></i>Seleccionar varias';
        currentProductRow = null;
      }
    });
    
    // Highlight the currently selected image in the modal
    function highlightSelectedImage() {
      if (!currentSelectedImageUrl) return;
      
      // Remove selected class from all images
      document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('selected-image');
      });
      
      // Add selected class to the currently selected image
      document.querySelectorAll('.image-item').forEach(item => {
        const itemImageUrl = item.getAttribute('data-image');
        if (itemImageUrl) {
          // Check if URLs match (handle both relative and absolute paths)
          const currentUrl = currentSelectedImageUrl.split('/').pop();
          const itemUrl = itemImageUrl.split('/').pop();
          if (currentUrl === itemUrl || currentSelectedImageUrl.includes(itemImageUrl) || itemImageUrl.includes(currentSelectedImageUrl)) {
            item.classList.add('selected-image');
          }
        }
      });
    }
    
    // Handle image selection
    function handleImageSelect(imageItem) {
      const imageUrl = imageItem.getAttribute('data-image');
      const imageType = imageItem.getAttribute('data-type');
      
      if (!imageUrl) return;
      
      // Multi-select mode - works for all image types
      if (multiSelectMode) {
        handleMultiSelect(imageItem, imageUrl);
      } else {
        // Single select mode
        currentSelectedImageUrl = imageUrl;
        
        // Update the selected class
        document.querySelectorAll('.image-item').forEach(item => {
          item.classList.remove('selected-image');
        });
        imageItem.classList.add('selected-image');
        
        // Close the modal
        imageModal.style.display = 'none';
        applySelectedImages();
      }
    }
    
    // Handle multi-select functionality
    function handleMultiSelect(imageItem, imageUrl) {
      const existingIndex = selectedImages.findIndex(img => img.url === imageUrl);
      
      if (existingIndex !== -1) {
        // Deselect if already selected
        selectedImages.splice(existingIndex, 1);
        imageItem.classList.remove('multi-selected');
        imageItem.removeAttribute('data-selection-order');
        // Remove number badge
        const badge = imageItem.querySelector('.selection-number-badge');
        if (badge) badge.remove();
      } else {
        // Select if not already selected and under limit
        if (selectedImages.length < 3) {
          selectedImages.push({
            url: imageUrl,
            element: imageItem
          });
          imageItem.classList.add('multi-selected');
          imageItem.setAttribute('data-selection-order', selectedImages.length);
          // Add number badge
          addSelectionBadge(imageItem, selectedImages.length);
        } else {
          // Show message that limit is reached
          alert('Solo puedes seleccionar hasta 3 imágenes');
        }
      }
      
      updateMultiSelectDisplay();
    }
    
    // Add selection number badge to image
    function addSelectionBadge(imageItem, number) {
      // Remove existing badge if any
      const existingBadge = imageItem.querySelector('.selection-number-badge');
      if (existingBadge) existingBadge.remove();
      
      const badge = document.createElement('div');
      badge.className = 'selection-number-badge';
      badge.textContent = number;
      imageItem.appendChild(badge);
    }
    
    // Update multi-select display (reorder badges if needed)
    function updateMultiSelectDisplay() {
      // Remove all badges first
      document.querySelectorAll('.selection-number-badge').forEach(badge => badge.remove());
      document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('multi-selected');
        item.removeAttribute('data-selection-order');
      });
      
      // Re-add badges in order
      selectedImages.forEach((img, index) => {
        const imageItem = img.element;
        imageItem.classList.add('multi-selected');
        imageItem.setAttribute('data-selection-order', index + 1);
        addSelectionBadge(imageItem, index + 1);
      });
    }
    
    // Add click events to all image items for selection (product and zakeke images)
    document.querySelectorAll('#productImagesGrid .image-item, #zakekeImagesGrid .image-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Only select if not clicking the delete button or badge
        if (!e.target.classList.contains('image-delete-btn') && 
            !e.target.closest('.image-delete-btn') &&
            !e.target.classList.contains('selection-number-badge')) {
          handleImageSelect(item);
        }
      });
    });
    
    // Handle image deletion (only for uploaded images)
    function handleImageDelete(imageItem) {
      const imageType = imageItem.getAttribute('data-type');
      
      // Only allow deletion of uploaded images
      if (imageType === 'uploaded') {
        const imageId = imageItem.getAttribute('data-id');
        const imageUrl = imageItem.getAttribute('data-image');
        
        // Store the deleted image info for potential undo
        lastDeletedImage = {
          id: imageId,
          type: imageType,
          url: imageUrl,
          element: imageItem.cloneNode(true)
        };
        
        // Remove from uploaded images array
        const index = uploadedImages.findIndex(img => img.url === imageUrl);
        if (index !== -1) {
          uploadedImages.splice(index, 1);
          saveImages();
        }
        
        // Remove from selected images if it's selected in multi-select mode
        const selectedIndex = selectedImages.findIndex(img => img.url === imageUrl);
        if (selectedIndex !== -1) {
          selectedImages.splice(selectedIndex, 1);
          updateMultiSelectDisplay();
        }
        
        // Remove the image from the DOM
        imageItem.remove();
      }
    }
    
    // File input handler is now set up via setupFileInputHandler() function
    
    // Drag and drop functionality - setup when modal opens
    function setupDragAndDrop() {
      // Find the current upload area in the modal (it might have been recreated)
      const uploadAreaElement = imageModal.querySelector('.upload-area');
      if (!uploadAreaElement) return null;
      
      // Remove existing listeners to avoid duplicates by cloning
      const newUploadArea = uploadAreaElement.cloneNode(true);
      uploadAreaElement.parentNode.replaceChild(newUploadArea, uploadAreaElement);
      
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        newUploadArea.addEventListener(eventName, preventDefaults, false);
      });

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Highlight drop area when item is dragged over it
      ['dragenter', 'dragover'].forEach(eventName => {
        newUploadArea.addEventListener(eventName, highlight, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        newUploadArea.addEventListener(eventName, unhighlight, false);
      });

      function highlight() {
        newUploadArea.classList.add('highlight');
      }

      function unhighlight() {
        newUploadArea.classList.remove('highlight');
      }

      // Handle dropped files (multiple)
      newUploadArea.addEventListener('drop', handleDrop, false);
      function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files.length > 0) {
          handleFiles(files);
        }
      }
      
      return newUploadArea;
    }
    
    // Setup drag and drop initially
    currentUploadArea = setupDragAndDrop();
    
    // Setup file input handler initially
    setupFileInputHandler();
});

