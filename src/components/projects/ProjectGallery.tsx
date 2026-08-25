import { ImageReveal } from "@/components/ui/ImageReveal";
import type { ProjectImage } from "@/types";

/**
 * Editorial gallery for a project page.
 *
 * Each image declares its own span, so the rhythm is set by the photography
 * rather than by a fixed grid — full-bleed for the establishing shots, paired
 * halves for details, and an offset column where a single image should sit
 * quietly against white space.
 */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  return (
    <div className="flex flex-col gap-[clamp(2rem,6vw,5rem)]">
      {groupImages(images).map((group, index) => {
        if (group.length === 2) {
          return (
            <div
              key={index}
              className="grid gap-[clamp(1.5rem,3vw,2.5rem)] md:grid-cols-2"
            >
              {group.map((image) => (
                <Figure
                  key={image.src}
                  image={image}
                  ratio="4/5"
                  sizes="(max-width: 768px) 100vw, 46vw"
                />
              ))}
            </div>
          );
        }

        const image = group[0];

        if (image.span === "offset") {
          return (
            <div key={index} className="grid md:grid-cols-12">
              <div className="md:col-span-7 md:col-start-4">
                <Figure
                  image={image}
                  ratio="4/3"
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              </div>
            </div>
          );
        }

        return (
          <Figure key={index} image={image} ratio="16/9" sizes="100vw" />
        );
      })}
    </div>
  );
}

function Figure({
  image,
  ratio,
  sizes,
}: {
  image: ProjectImage;
  ratio: string;
  sizes: string;
}) {
  return (
    <figure>
      <ImageReveal
        src={image.src}
        alt={image.alt}
        ratio={ratio}
        sizes={sizes}
        parallax={6}
      />
      {image.caption && (
        <figcaption className="mt-4 max-w-[52ch] text-[0.8125rem] leading-relaxed text-stone">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Collapses consecutive `half` images into pairs so they can share a row.
 * Everything else stands alone.
 */
function groupImages(images: ProjectImage[]): ProjectImage[][] {
  const groups: ProjectImage[][] = [];

  for (const image of images) {
    const last = groups[groups.length - 1];

    if (image.span === "half" && last?.length === 1 && last[0].span === "half") {
      last.push(image);
    } else {
      groups.push([image]);
    }
  }

  return groups;
}
