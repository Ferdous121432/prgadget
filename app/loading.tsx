import loader from "@/public/assets/loader.gif";
import Image from "next/image";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}>
      <Image
        src={loader}
        alt="Loading..."
        width={150}
        height={150}
        priority
        unoptimized // GIFs should not be optimized
      />
    </div>
  );
};

export default Loading;
