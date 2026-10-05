import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ResumeData } from "../types"
import { formatDateRange } from "../format"

const ACCENT = "#2563eb"

const styles = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  sidebar: {
    width: "32%",
    backgroundColor: "#f5f6f8",
    padding: 24,
  },
  main: { width: "68%", padding: 28 },
  name: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  headline: { fontSize: 10, color: ACCENT, marginBottom: 12 },
  sidebarSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#666666",
    marginTop: 16,
    marginBottom: 6,
  },
  sidebarText: { fontSize: 9, lineHeight: 1.4, color: "#333333" },
  skillItem: { fontSize: 9, marginBottom: 3, color: "#333333" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginTop: 14,
    marginBottom: 6,
  },
  entry: { marginBottom: 10 },
  entryTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  entrySubtitle: { fontSize: 9.5, color: "#444444" },
  entryDates: { fontSize: 8.5, color: "#888888", marginBottom: 2 },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletMarker: { width: 10, fontSize: 9, color: ACCENT },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
})

export function ModernResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{data.full_name}</Text>
          {data.headline && <Text style={styles.headline}>{data.headline}</Text>}

          <Text style={styles.sidebarSectionTitle}>Contact</Text>
          {data.contact_email && <Text style={styles.sidebarText}>{data.contact_email}</Text>}
          {data.location && <Text style={styles.sidebarText}>{data.location}</Text>}

          {data.skills.length > 0 && (
            <>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.skillItem}>
                  {skill.name}
                </Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.main}>
          {data.bio && (
            <>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={{ fontSize: 9.5, lineHeight: 1.4 }}>{data.bio}</Text>
            </>
          )}

          {data.jobs.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.jobs.map((job, i) => (
                <View key={i} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>{job.title}</Text>
                  <Text style={styles.entrySubtitle}>
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </Text>
                  <Text style={styles.entryDates}>
                    {formatDateRange(job.start_date, job.end_date, job.is_current)}
                  </Text>
                  {job.description && (
                    <Text style={{ fontSize: 9.5, marginTop: 2, lineHeight: 1.4 }}>
                      {job.description}
                    </Text>
                  )}
                  {job.highlights.map((h, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletMarker}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          {data.projects.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Projects</Text>
              {data.projects.map((project, i) => (
                <View key={i} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>{project.name}</Text>
                  {project.summary && (
                    <Text style={styles.entrySubtitle}>{project.summary}</Text>
                  )}
                  {project.tech_stack.length > 0 && (
                    <Text style={{ fontSize: 8.5, color: "#888888", marginTop: 1 }}>
                      {project.tech_stack.join(" · ")}
                    </Text>
                  )}
                  {project.highlights.map((h, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletMarker}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  )
}
