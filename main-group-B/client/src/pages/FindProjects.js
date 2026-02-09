import React from "react";

function FindProjects() {
  return (
    <div style={{ padding: "30px", background: "#f5f6fa", minHeight: "100vh" }}>
      
      <h1>Find Projects</h1>
      <p>Browse and apply to projects that match your skills</p>

     <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginTop: "20px",
        marginBottom: "20px"
        }}>

        <div style={{ display: "flex", gap: "10px" }}>
            <input
            placeholder="Search projects..."
            style={{ padding: "10px", flex: 1 }}
            />

            <button style={{
            padding: "10px 20px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px"
            }}>
            Search
            </button>
        </div>

  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
    <select style={{ padding: "10px", flex: 1 }}>
      <option>All Categories</option>
    </select>

    <select style={{ padding: "10px", flex: 1 }}>
      <option>All Budgets</option>
    </select>
  </div>

</div>


      {/* Project Card */}
      <div style={{
        background: "white",
        padding: "20px",
        marginBottom: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>

        <h3>E-commerce Website Development</h3>

        <p style={{ color: "gray", fontSize: "14px" }}>
            ⏱ 2 hours ago • Remote • 8 proposals
        </p>

        <p>
            Looking for an experienced developer to build a modern e-commerce platform with React and Node.js.
        </p>

        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>React</span>
            <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Node.js</span>
            <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>MongoDB</span>
            <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>Stripe</span>
        </div>
        <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "10px"
        }}>

        <p style={{ fontSize: "14px" }}>
            Budget: $2,500 - $4,000 &nbsp;&nbsp;
            Duration: 2–3 months &nbsp;&nbsp;
            Client: TechCorp Solutions
        </p>

        <button style={{
            padding: "10px 20px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px"
        }}>
            Apply Now
        </button>

        </div>



        </div>


      <div style={{
  background: "white",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>

  <h3>Mobile App UI/UX Design</h3>

  <p style={{ color: "gray", fontSize: "14px" }}>
    ⏱ 5 hours ago • Remote • 12 proposals
  </p>

  <p>
    Need a creative designer to create modern, user-friendly mobile app designs for iOS and Android.
  </p>

  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Figma</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>UI/UX</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Mobile Design</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>Prototyping</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  }}>

    <p style={{ fontSize: "14px" }}>
      Budget: $1,200 - $2,000 &nbsp;&nbsp;
      Duration: 3–4 weeks &nbsp;&nbsp;
      Client: StartupXYZ
    </p>

    <button style={{
      padding: "10px 20px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px"
    }}>
      Apply Now
    </button>

  </div>

</div>


      <div style={{
  background: "white",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>

  <h3>Python Backend Developer</h3>

  <p style={{ color: "gray", fontSize: "14px" }}>
    ⏱ 3 hours ago • Remote • 6 proposals
  </p>

  <p>
    Need experienced Python developer for building REST APIs.
  </p>

  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Python</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>FastAPI</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>PostgreSQL</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>Docker</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  }}>

    <p style={{ fontSize: "14px" }}>
      Budget: $3,000 - $5,000 &nbsp;&nbsp;
      Duration: 2–3 months &nbsp;&nbsp;
      Client: DataFlow Inc.
    </p>

    <button style={{
      padding: "10px 20px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px"
    }}>
      Apply Now
    </button>

  </div>

</div>

<div style={{
  background: "white",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>

  <h3>Content Writer for Tech Blog</h3>

  <p style={{ color: "gray", fontSize: "14px" }}>
    ⏱ 1 day ago • Remote • 15 proposals
  </p>

  <p>
    Seeking experienced tech writer to create engaging articles about software development, AI and emerging technologies.
  </p>

  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Content Writing</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Tech Knowledge</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>SEO</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>Research</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  }}>

    <p style={{ fontSize: "14px" }}>
      Budget: $500 - $800 &nbsp;&nbsp;
      Duration: 1 month &nbsp;&nbsp;
      Client: Digital Media Co.
    </p>

    <button style={{
      padding: "10px 20px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px"
    }}>
      Apply Now
    </button>

  </div>

</div>

<div style={{
  background: "white",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>

  <h3>Social Media Marketing Campaign</h3>

  <p style={{ color: "gray", fontSize: "14px" }}>
    ⏱ 6 hours ago • Remote • 20 proposals
  </p>

  <p>
    Looking for social media expert to manage and grow our Instagram and TikTok presence. Must have proven track record.Need a creative designer to create modern, user-friendly mobile app designs for iOS and Android.
  </p>

  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Social Media</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Content Strategy</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>Analytics</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>Instagram</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  }}>

    <p style={{ fontSize: "14px" }}>
      Budget: $800 - $1,500 &nbsp;&nbsp;
      Duration: 1-2 months &nbsp;&nbsp;
      Client: Fashion Brand Co.
    </p>

    <button style={{
      padding: "10px 20px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px"
    }}>
      Apply Now
    </button>

  </div>

</div>

<div style={{
  background: "white",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>

  <h3>WordPress Plugin Development</h3>

  <p style={{ color: "gray", fontSize: "14px" }}>
    ⏱ 4 hours ago • Remote • 10 proposals
  </p>

  <p>
    Need WordPress expert to develop custom plugin for e-commerce functionality. Must follow WordPress coding standards.
  </p>

  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>WordPress</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>PHP</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", marginRight: "8px", borderRadius: "6px" }}>MySQL</span>
    <span style={{ background: "#e6f0ff", padding: "5px 10px", borderRadius: "6px" }}>JavaScript</span>
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  }}>

    <p style={{ fontSize: "14px" }}>
      Budget: $1,500 - $2,500 &nbsp;&nbsp;
      Duration: 1 month &nbsp;&nbsp;
      Client: Web Agency Pro
    </p>

    <button style={{
      padding: "10px 20px",
      background: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px"
    }}>
      Apply Now
    </button>

  </div>

</div>

    </div>
  );
}

export default FindProjects;
