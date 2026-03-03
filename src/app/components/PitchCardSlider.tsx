import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface PitchCardSliderProps {
  images: string[];
  alt: string;
}

export default function PitchCardSlider({ images, alt }: PitchCardSliderProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-600">
        No Image
      </div>
    );
  }

  return (
    <div className="pitch-card-slider w-full h-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={images.length > 1}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`${alt} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
