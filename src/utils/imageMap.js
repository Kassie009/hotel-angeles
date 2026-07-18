import sencillaImg from '../assets/sencilla.jpg';
import sencilla2Img from '../assets/sencilla2.jpg';
import dobleImg from '../assets/doble.jpg';
import doble2Img from '../assets/doble2.jpg';
import familiarImg from '../assets/familiar.jpg';
import familiar3Img from '../assets/familiar3.jpg';
import doble3Img from '../assets/doble3.jpg';

const imageMap = {
  'sencilla.jpg': sencillaImg,
  'sencilla2.jpg': sencilla2Img,
  'doble.jpg': dobleImg,
  'doble2.jpg': doble2Img,
  'familiar.jpg': familiarImg,
  'familiar3.jpg': familiar3Img,
  'doble3.jpg': doble3Img,
};

export const getImageByPath = (path) => {
  if (!path) return null;
  const fileName = path.split('/').pop();
  return imageMap[fileName] || null;
};

export default imageMap;