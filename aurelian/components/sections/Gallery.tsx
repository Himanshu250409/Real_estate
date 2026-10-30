"use client";
import { useEffect, useRef } from "react";
import { gsap, reduced } from "@/lib/gsap";
import { site } from "@/config/site";
import ImageSlot from "../ImageSlot";
import WordReveal from "../WordReveal";
import Divider from "../Divider";

/** Gallery — bento grid of every render we have; each tile unveils with a clip-path wipe + slow settle. */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".gl-tile").forEach((el) => {
        const img = el.querySelector(".gl-img");
        gsap.fromTo(el, { clipPath: "inset(12% 8% 12% 8% round 24px)", opacity: 0.4 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", end: "top 40%", scrub: 0.8 } });
        gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 30%", scrub: 0.8 } });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} id="gallery" className="section section-forest overflow-hidden">
      <div className="mx-auto max-w-[1500px]">
        <p className="label label-gold mb-10">Gallery</p>
        <WordReveal text="Seen from *every* angle." />
        <div className="mt-[clamp(48px,8vh,120px)] grid grid-cols-1 gap-[clamp(16px,2vw,32px)] md:grid-cols-12">
          {site.images.gallery.map((g) => (
            <figure key={g.src} className={`gl-tile relative overflow-hidden ${g.span}`} data-cursor="View">
              <div className="gl-img absolute inset-0"><ImageSlot src={g.src} alt={g.caption} tone="ink" className="h-full w-full" /></div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-6 pb-5 pt-16">
                <figcaption className="label on-photo text-ivory">{g.caption}</figcaption>
              </div>
            </figure>
          ))}
        </div>
        <p className="body-lux mt-12 text-ivory/90">{site.disclaimer}</p>
      </div>
      <Divider />
    </section>
  );
}
