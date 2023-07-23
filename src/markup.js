export function creatGalleryMarkup({
  webformatURL,
  downloads,
  comments,
  views,
  likes,
  tags,
  largeImageURL,
}) {
  return `<div class="photo-card">
  <a class="link" href="${largeImageURL}"><img class="img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
}

export function createPaginationMarcap(totalPages) {
  let arr = [];
  for (let i = 1; i <= totalPages; i += 1) {
    let markup = `<li class="page__numbers">${i}</li>`;
    arr.push(markup);
  }
  return arr.join('');
}
