import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="dark">{children}</div>;
};

export default layout;
