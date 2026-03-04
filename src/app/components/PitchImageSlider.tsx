import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface PitchImageSliderProps {
  images: string[];
  alt: string;
}

export default function PitchImageSlider({ images, alt }: PitchImageSliderProps) {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-slate-800 flex items-center justify-center">
        <span className="text-slate-600">No images available</span>
      </div>
    );
  }

  return (
    <div className="pitch-slider aspect-video bg-slate-800">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
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
