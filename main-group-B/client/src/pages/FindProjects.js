import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "../layout/PageContainer";
import ProjectCard from "../components/ProjectCard";

function FindProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Figma mock cards (used if backend has less data)
  const mockProjects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      description:
        "Looking for an experienced developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment integrations.",
      skills: ["React", "Node.js", "MongoDB", "Stripe"],
      budget: "$2,500 - $4,000",
      duration: "2-3 months",
      client: "TechCorp Solutions",
      time: "2 hours ago",
      proposals: 8,
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      description:
        "Need a creative designer to create modern, user-friendly mobile app designs for iOS and Android. Portfolio required.",
      skills: ["Figma", "UI/UX", "Mobile Design", "Prototyping"],
      budget: "$1,200 - $2,000",
      duration: "3-4 weeks",
      client: "StartupXYZ",
      time: "5 hours ago",
      proposals: 12,
    },
    {
      id: 3,
      title: "Content Writer for Tech Blog",
      description:
        "Seeking experienced tech writer to create engaging articles about software development, AI, and emerging technologies.",
      skills: ["Content Writing", "SEO", "Research", "Tech Knowledge"],
      budget: "$500 - $800",
      duration: "1 month",
      client: "Digital Media Co.",
      time: "1 day ago",
      proposals: 15,
    },
    {
      id: 4,
      title: "Python Backend Developer",
      description:
        "Need experienced Python developer for building RESTful APIs and microservices. Experience with FastAPI and PostgreSQL required.",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
      budget: "$3,000 - $5,000",
      duration: "2-3 months",
      client: "DataFlow Inc.",
      time: "3 hours ago",
      proposals: 6,
    },
    {
      id: 5,
      title: "Social Media Marketing Campaign",
      description:
        "Looking for social media expert to manage and grow our Instagram and TikTok presence. Must have proven track record.",
      skills: ["Social Media", "Content Strategy", "Analytics", "Instagram"],
      budget: "$800 - $1,500",
      duration: "1-2 months",
      client: "Fashion Brand Co.",
      time: "6 hours ago",
      proposals: 20,
    },
    {
      id: 6,
      title: "WordPress Plugin Development",
      description:
        "Need WordPress expert to develop custom plugin for e-commerce functionality. Must follow WordPress coding standards.",
      skills: ["WordPress", "PHP", "MySQL", "JavaScript"],
      budget: "$1,500 - $2,500",
      duration: "1 month",
      client: "Web Agency Pro",
      time: "4 hours ago",
      proposals: 10,
    },
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/projects")
      .then((res) => {
        if (res.data.length < 4) {
          setProjects(mockProjects); // use full figma set
        } else {
          setProjects(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setProjects(mockProjects); // fallback
        setLoading(false);
      });
  }, []);

  if (loading) return <PageContainer>Loading...</PageContainer>;

  return (
    <PageContainer>
      <div style={{ padding: "30px", background: "#f3f4f6", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1050px", margin: "auto" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "700" }}>Find Projects</h1>
          <p style={{ color: "#6b7280", marginBottom: "25px" }}>
            Browse and apply to projects that match your skills
          </p>

          {/* Search Box */}
          <div
            style={{
              background: "white",
              padding: "22px",
              borderRadius: "16px",
              marginBottom: "30px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                placeholder="Search projects..."
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                }}
              />
              <button
                style={{
                  background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
                  color: "white",
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                }}
              >
                Search
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
              <select style={{ flex: 1, padding: "10px", borderRadius: "8px" }}>
                <option>All Categories</option>
              </select>
              <select style={{ flex: 1, padding: "10px", borderRadius: "8px" }}>
                <option>All Budgets</option>
              </select>
            </div>
          </div>

          {/* Project Cards */}
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export default FindProjects;
