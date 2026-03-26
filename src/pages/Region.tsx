/**
 * PAGE DE LA RÉGION
 * Une page dédiée à la culture Kabyle que j'ai intégrée avec une galerie d'images zoomables.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionReveal from "@/components/SectionReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
// import heroImg from "@/assets/background-main-image.jpg";
import oliveImg2 from "@/assets/olive-img-2.jpg";
import oliveImg5 from "@/assets/olive-img-5.jpg";

const Region = () => {
  const heroImg = "/region-background.jpg";
  const { t } = useTranslation();
  
  // State to manage the currently enlarged image in the gallery
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [heroImg, oliveImg5, oliveImg2, "/region1.jpg", "/region2.jpg", "/region3.jpg"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Paysage de Kabylie"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-12 left-6 lg:left-10 z-10 max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-[0.95]"
          >
            {t("region.hero.title")}
          </motion.h1>
        </div>
      </section>

      {/* La Terre */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <BackButton className="mb-2" />
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <SectionReveal>
            <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
              {t("region.earth.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("region.earth.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("region.earth.desc1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("region.earth.desc2")}
            </p>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src={oliveImg2}
                alt="Oliveraie de Kabylie"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Les Hommes */}
      <section className="bg-primary py-20 lg:py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8 max-w-xl">
              {t("region.people.title")}
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl leading-relaxed mb-4">
              {t("region.people.desc1")}
            </p>
            <p className="text-primary-foreground/70 max-w-2xl leading-relaxed">
              {t("region.people.desc2")}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <SectionReveal delay={0.2}>
            <div className="overflow-hidden rounded-2xl">
              <motion.img
                src="https://i.pinimg.com/1200x/bc/3f/82/bc3f82cb30f0f51d3b0e1e69b5e5264b.jpg"
                alt="Histoire de Kabylie"
                className="w-full h-[350px] lg:h-[450px] object-cover grayscale-[30%]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </SectionReveal>
          <SectionReveal>
            <span className="inline-block border border-foreground/20 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase text-muted-foreground mb-6">
              {t("region.history.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("region.history.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("region.history.desc1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("region.history.desc2")}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Image gallery with zoom effect on click */}
      <section className="py-24 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <SectionReveal key={i} delay={i * 0.1}>
              <motion.div
                layoutId={`img-${i}`} // layoutId allows Framer Motion to animate the image transition to the modal
                onClick={() => setSelectedImage(img)}
                className="relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer group shadow-xl"
              >
                <img
                  src={img}
                  alt="Kabylie Landscape"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">{t("gallery.view")}</span>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Zoom Modal */}
      {/* Zoom Modal: Using AnimatePresence so Framer Motion can detect when the element leaves the DOM */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={`img-${images.indexOf(selectedImage)}`} // Matches the layoutId from the list for the transition animation
              className="relative max-w-5xl w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged Kabylie"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Region;
