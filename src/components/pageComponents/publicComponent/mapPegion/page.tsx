// "use client";

// interface MapSectionProps {
//   mapLink: string;
// }

// export default function MapPigeon({ mapLink }: MapSectionProps) {
//   return (
//     <div style={{ width: "100%", height: "400px", borderRadius: "8px", overflow: "hidden" }}>
//       <iframe
//         src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14610.938407125614!2d90.36310641266084!3d23.72116980394712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf2ad0dff901%3A0xa72cc676b553705!2sKamrangirchar%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1760272206876!5m2!1sen!2sbd"
//         width="600"
//         height="200"
//         loading="lazy"
//       ></iframe>
//     </div>
//   );
// }


"use client";

interface MapSectionProps {
  mapLink: string;
}

export default function MapPigeon({ mapLink }: MapSectionProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%", // 16:9 aspect ratio
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        dangerouslySetInnerHTML={{ __html: mapLink }}
      />
    </div>
  );
}
