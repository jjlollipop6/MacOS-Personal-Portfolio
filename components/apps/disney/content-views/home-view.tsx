"use client";

import { useMemo } from "react";
import { Title, Brand } from "../types";
import { getSliderTitles, getTitlesByCategory } from "../data/titles";
import { ImgSlider } from "../img-slider";
import { ViewersRow } from "../viewers-row";
import { ContentRow } from "../content-row";

interface HomeViewProps {
  brands: Brand[];
  onTitleClick: (title: Title) => void;
  onBrandClick: (brandId: string) => void;
  isMobileView: boolean;
}

export function HomeView({ brands, onTitleClick, onBrandClick, isMobileView }: HomeViewProps) {
  const slider = useMemo(() => getSliderTitles(), []);
  const recommends = useMemo(() => getTitlesByCategory("recommend"), []);
  const projects = useMemo(() => getTitlesByCategory("projects"), []);
  const personalVentures = useMemo(() => getTitlesByCategory("personal-ventures"), []);
  const internPictures = useMemo(() => getTitlesByCategory("intern-pictures"), []);
  const trending = useMemo(() => getTitlesByCategory("trending"), []);

  return (
    <div className="flex flex-col">
      <ImgSlider titles={slider} onSlideClick={onTitleClick} isMobileView={isMobileView} />

      <ViewersRow brands={brands} onBrandClick={onBrandClick} isMobileView={isMobileView} />

      <ContentRow title="Recommended for You" titles={recommends} onTitleClick={onTitleClick} isMobileView={isMobileView} />

      <ContentRow title="Projects" titles={projects} onTitleClick={onTitleClick} isMobileView={isMobileView} />

      <ContentRow title="Personal Ventures" titles={personalVentures} onTitleClick={onTitleClick} isMobileView={isMobileView} />

      <ContentRow title="Intern Pictures" titles={internPictures} onTitleClick={onTitleClick} isMobileView={isMobileView} />

      <ContentRow title="Trending" titles={trending} onTitleClick={onTitleClick} isMobileView={isMobileView} />
    </div>
  );
}
