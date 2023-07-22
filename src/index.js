import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import axios from 'axios';
import { creatGalleryMarkup } from './markup';

const URL = 'https://pixabay.com/api/';
const key = '38388037-1512b522da0d657b891be2adb';
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');
const btnUp = document.querySelector('.button-up');
const btnDown = document.querySelector('.button-down');

let page = 1;
let search = '';
let totalHits = 0;
let lightbox;
async function getPictures(page, value) {
  const response = await axios(
    `${URL}?key=${key}&q=${value}&image_type=photo$orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return response;
}
form.addEventListener('submit', onClick);

async function onClick(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  gallery.innerHTML = '';
  page = 11;
  search = searchQuery.value
    .split(' ')
    .filter(item => item !== '')
    .join('+');
  if (search) {
    try {
      let data = await getPictures(page, search);
      if (data.data.total === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        gallery.insertAdjacentHTML(
          'beforeend',
          data.data.hits.map(object => creatGalleryMarkup(object)).join('')
        );
          lightbox = new SimpleLightbox('.gallery a', {
          captionDelay: 250,
          captionsData: 'alt',
        });
        Notify.success(`Hooray! We found ${data.data.totalHits} images.`);
        totalHits = data.data.totalHits;
        observer.observe(target);
        console.log(gallery.getBoundingClientRect());
      }
    } catch (error) {}
  }
}

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let observer = new IntersectionObserver(observerHandler, options);

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
          lightbox.destroy();
          lightbox = new SimpleLightbox('.gallery a', {
            captionDelay: 250,
            captionsData: 'alt',
          });
          btnUp.hidden = false;
        } catch (error) {
          Notify.failure('Ooops, something went wrong!');
        }
      }
    }
  });
};

btnUp.addEventListener('click', (e) => {
  console.log(gallery.getBoundingClientRect());
  window.scrollBy({
  top: gallery.getBoundingClientRect().top,
  behavior: "smooth",
});
})

 



