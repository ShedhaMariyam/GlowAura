    new Swiper('.categorySwiper', {
        slidesPerView: 1.2,
        spaceBetween: 25,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1400: { slidesPerView: 4.5 }
        }
    });