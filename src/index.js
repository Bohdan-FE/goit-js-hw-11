import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import axios from 'axios';
import { creatGalleryMarkup, createPaginationMarcap } from './markup';
Notify.init({
  opacity: 1,
  timeout: 1500,
});

const URL = 'https://pixabay.com/api/';
const key = '38388037-1512b522da0d657b891be2adb';
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');
const btnUp = document.querySelector('.button-up');
const btnDown = document.querySelector('.button-down');
const arrowBtns = document.querySelector('.arrow-buttons');
const settingsContainer = document.querySelector('.settings-container');
const settingsBtn = document.querySelector('.settings-btn');
const settingForm = document.querySelector('.setting-form');
const left = document.querySelector('.left');
const paginationList = document.querySelector('.pagination__list');

settingsBtn.addEventListener('click', e => {
  settingsContainer.classList.toggle('visually-hidden');
  e.currentTarget.classList.toggle('active');
});

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let observer = new IntersectionObserver(observerHandler, options);
let lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

let page = 1;
let search = '';
let totalHits = 0;
let paginationValue = 'infinityScroll';
let themeValue = 'dark';

settingForm.addEventListener('submit', e => {
  e.preventDefault();
  const {
    elements: { theme, pagination },
  } = e.currentTarget;
  btnDown.hidden = true;
  observer.unobserve(target);
  gallery.innerHTML = '';
  paginationList.classList.add('visually-hidden');
  themeValue = theme.value;
  paginationValue = pagination.value;
  settingsContainer.classList.toggle('visually-hidden');
  themeValue = theme.value;
  if (themeValue === 'dark') {
    document.body.classList.remove('bright');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('bright');
  }
});

async function getPictures(page, value) {
  const response = await axios(
    `${URL}?key=${key}&q=${value}&image_type=photo$orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return response;
}

form.addEventListener('submit', onClick);

async function onClick(e) {
  e.preventDefault();
  observer.unobserve(target);
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  gallery.innerHTML = '';
  page = 1;
  search = searchQuery.value
    .split(' ')
    .filter(item => item !== '')
    .join('+');
  if (search) {
    try {
      let data = await getPictures(page, search);
      if (data.data.total === 0 || data.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        btnDown.hidden = true;
      } else {
        gallery.insertAdjacentHTML(
          'beforeend',
          data.data.hits.map(object => creatGalleryMarkup(object)).join('')
        );
        Notify.success(`Hooray! We found ${data.data.totalHits} images.`);
        totalHits = data.data.totalHits;
        lightbox.refresh();
        btnDown.hidden = false;
        if (paginationValue === 'infinityScroll') {
          observer.observe(target);
        } else if (paginationValue === 'pagination') {
          paginationList.classList.remove('visually-hidden');
          document
            .querySelectorAll('.page__numbers')
            .forEach(element => element.remove());
          left.insertAdjacentHTML(
            'afterend',
            createPaginationMarcap(Math.ceil(totalHits / 40))
          );
          paginationList.children[page].classList.add('current');
          paginationList.addEventListener('click', async e => {
            if (e.target.classList.contains('page__numbers')) {
              paginationList.children[page].classList.remove('current');
              page = Number(e.target.textContent);
              data = await getPictures(page, search);
              gallery.innerHTML = data.data.hits
                .map(object => creatGalleryMarkup(object))
                .join('');
              paginationList.children[page].classList.add('current');
              lightbox.refresh();
            } else if (e.target.classList.contains('material-icons-left')) {
              if (page === 1) {
                return;
              } else {
                paginationList.children[page].classList.remove('current');
                page -= 1;
                data = await getPictures(page, search);
                gallery.innerHTML = data.data.hits
                  .map(object => creatGalleryMarkup(object))
                  .join('');
                paginationList.children[page].classList.add('current');
                lightbox.refresh();
              }
            } else if (e.target.classList.contains('material-icons-right')) {
              if (page === Math.ceil(totalHits / 40)) {
                return;
              } else {
                paginationList.children[page].classList.remove('current');
                page += 1;
                data = await getPictures(page, search);
                gallery.innerHTML = data.data.hits
                  .map(object => creatGalleryMarkup(object))
                  .join('');
                paginationList.children[page].classList.add('current');
                lightbox.refresh();
              }
            }
          });
        }
      }
    } catch (error) {
      Notify.failure('Ooops, something went wrong!');
    }
  }
}

function observerHandler(entries, observer) {
  entries.forEach(async element => {
    if (element.isIntersecting) {
      page += 1;
      if (page <= Math.ceil(totalHits / 40)) {
        try {
          let response = await getPictures(page, search);
          gallery.insertAdjacentHTML(
            'beforeend',
            response.data.hits
              .map(object => creatGalleryMarkup(object))
              .join('')
          );
          lightbox.refresh();
        } catch (error) {
          Notify.failure('Ooops, something went wrong!');
        }
      }
    }
  });
}
function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}
arrowBtns.addEventListener('click', e => {
  if (e.target === btnUp) {
    scrollToTop();
  } else if (e.target === btnDown) {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  }
});

document.addEventListener('scroll', skrollHandler);
function skrollHandler(e) {
  if (gallery.getBoundingClientRect().top < -200) {
    btnUp.hidden = false;
  } else btnUp.hidden = true;
}
