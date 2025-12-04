// JS basic demo
document.addEventListener('DOMContentLoaded', () => {

    // Original functionality
    document.getElementById('agregarCantidadDesktop').addEventListener('click', () => alert('Agregar nueva fila'));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => alert('Eliminar fila')));
    document.getElementById('saveItemCotization').addEventListener('click', () => alert('Guardado'));
    
    // Image storage and management
    let lastDeletedImage = null;
    let uploadedImages = [];
    let currentSelectedImageUrl = document.getElementById('selectedProductImage').src;
    
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
    document.addEventListener('paste', handlePaste, false);

    function handlePaste(e) {
        // Only handle paste events when the modal is open
        const modal = document.getElementById('imageModal');
        const isModalOpen = modal && modal.style.display === 'flex';
        
        if (!isModalOpen) return;
        
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
      const uploadedImagesGrid = document.getElementById('uploadedImagesGrid');
      
      // Clear existing uploaded images (except the upload area)
      const uploadArea = uploadedImagesGrid.querySelector('.upload-area');
      uploadedImagesGrid.innerHTML = '';
      uploadedImagesGrid.appendChild(uploadArea);
      
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
          if (e.target !== deleteBtn && !deleteBtn.contains(e.target)) {
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
    const selectImageBtn = document.getElementById('selectImageBtn');
    const imageModal = document.getElementById('imageModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const selectedProductImage = document.getElementById('selectedProductImage');
    const imageUploadInput = document.getElementById('imageUploadInput');
    
    // Load saved images when page loads
    loadSavedImages();
    
    // Open modal
    selectImageBtn.addEventListener('click', () => {
      imageModal.style.display = 'flex';
      highlightSelectedImage();
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', () => {
      imageModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        imageModal.style.display = 'none';
      }
    });
    
    // Highlight the currently selected image in the modal
    function highlightSelectedImage() {
      // Remove selected class from all images
      document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('selected-image');
      });
      
      // Add selected class to the currently selected image
      const currentImageUrl = selectedProductImage.src;
      
      document.querySelectorAll('.image-item').forEach(item => {
        const itemImageUrl = item.getAttribute('data-image');
        if (itemImageUrl && currentImageUrl.includes(itemImageUrl)) {
          item.classList.add('selected-image');
        }
      });
    }
    
    // Handle image selection
    function handleImageSelect(imageItem) {
      const imageUrl = imageItem.getAttribute('data-image');
      if (imageUrl) {
        // Update the selected image
        selectedProductImage.src = imageUrl;
        currentSelectedImageUrl = imageUrl;
        
        // Update the selected class
        document.querySelectorAll('.image-item').forEach(item => {
          item.classList.remove('selected-image');
        });
        imageItem.classList.add('selected-image');
        
        // Close the modal
        imageModal.style.display = 'none';
      }
    }
    
    // Add click events to all image items for selection
    document.querySelectorAll('.image-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Only select if not clicking the delete button
        if (!e.target.classList.contains('image-delete-btn') && !e.target.closest('.image-delete-btn')) {
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
        
        // Remove from the array
        const index = uploadedImages.findIndex(img => img.url === imageUrl);
        if (index !== -1) {
          uploadedImages.splice(index, 1);
          saveImages();
        }
        
        // Remove the image from the DOM
        imageItem.remove();
      }
    }
    
    // Handle file upload for multiple files
    imageUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset the file input
        imageUploadInput.value = '';
      }
    });
    
    // Drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
      uploadArea.classList.add('highlight');
    }

    function unhighlight() {
      uploadArea.classList.remove('highlight');
    }

    // Handle dropped files (multiple)
    uploadArea.addEventListener('drop', handleDrop, false);
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files && files.length > 0) {
        handleFiles(files);
      }
    }
});