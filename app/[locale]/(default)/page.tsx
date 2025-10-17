import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Feature4 from "@/components/blocks/feature4";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import { getLandingPage } from "@/services/page";
import { HairCutEffect } from "@/components/haircut/HairCutEffect";
import HairStyleSelector from "@/components/hair/HairStyleSelector";
import { HairStyleGrid } from "@/components/blocks/images/imgGrid";
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getLandingPage(locale);

  return (
    <>
      {<HairCutEffect /> }
      {page.hero && <Hero hero={page.hero} />}
      {page.editor && <HairStyleSelector editor={page.editor} />}
      {page.example && <HairStyleGrid example={page.example} />}
      {/* {page.branding && <Branding section={page.branding} />} */}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {/* {page.showcase && <Showcase section={page.showcase} />} */}
      {/* {page.stats && <Stats section={page.stats} />} */}
      {/* {page.pricing && <Pricing pricing={page.pricing} />} */}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      {page.externalLinks && <Feature4 section={page.externalLinks}/>}
      {page.cta && <CTA section={page.cta} />}
    </>
  );
}
