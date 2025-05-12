//this will run as defered so the  ducument is already loded
document.querySelectorAll('.list-group-item').forEach((element) => {
  if (location.href.includes(element.href)) {
    element.classList.add('active');
  }
});
