function pageChanger() {
  const app = document.querySelector('.app');
  if (!app) return;

  const sections = app.querySelectorAll(':scope > section');
  if (sections.length === 0) return;

  let activeIndex = 0;

  sections.forEach((section, i) => {
    if (section.classList.contains('screen--active')) activeIndex = i;
  });

  const nextIndex = (activeIndex + 1) % sections.length;

  sections[activeIndex].classList.remove('screen screen--active');
  sections[activeIndex].classList.add('screen');
  sections[nextIndex].classList.add('screen--active');
  sections[nextIndex].classList.remove('screen');
}