import { getImageProps } from "next/image";

const SOCIAL_IMAGE_WIDTH = 1200;

// Link-preview fetchers such as Bluesky reject large images, so og:image points
// at a resized copy from the image optimiser. The first srcSet entry is the 1x
// width; `src` would be the 2x one.
export function socialImageUrl(src: string) {
	const { props } = getImageProps({
		src,
		alt: "",
		width: SOCIAL_IMAGE_WIDTH,
		height: SOCIAL_IMAGE_WIDTH,
	});
	return props.srcSet?.split(" ")[0] ?? props.src;
}
