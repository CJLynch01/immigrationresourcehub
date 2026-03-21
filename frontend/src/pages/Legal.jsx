import useSEO from "../hooks/useSEO.js";

export default function Legal() {
  useSEO({ title: "Legal", description: "Legal information for Immigration Pathways Consulting LLC." });
  return (
    <div className="legal-page">
      <h1>Legal</h1>
      <p>Privacy Policy / Terms placeholder.</p>
    </div>
  );
}
