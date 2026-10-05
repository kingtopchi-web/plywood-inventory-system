import Swal from 'sweetalert2';

export const confirmDelete = async (itemName) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    html: `Do you want to delete <b>${itemName}</b>?<br/>This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ee5d50', // Danger color for delete
    cancelButtonColor: '#8a9ab7', // Secondary text color
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    customClass: {
      popup: 'swal-modern-popup',
      title: 'swal-modern-title',
      actions: 'swal-modern-actions',
      confirmButton: 'swal-modern-btn swal-btn-danger',
      cancelButton: 'swal-modern-btn swal-btn-cancel'
    },
    buttonsStyling: false
  });

  return result.isConfirmed;
};
