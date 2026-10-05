import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { ResumeData } from "../types"
import { formatDateRange } from "../format"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  headline: { fontSize: 11, color: "#444444", marginBottom: 4 },
  contactRow: { flexDirection: "row", gap: 10, fontSize: 9, color: "#666666", marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 3,
  },
  entry: { marginBottom: 8 },
  entryHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  entrySubtitle: { fontSize: 10, color: "#333333" },
  entryDates: { fontSize: 9, color: "#666666" },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletMarker: { width: 10, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    fontSize: 9,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
  },
})

export function ClassicResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{data.full_name}</Text>
        {data.headline && <Text style={styles.headline}>{data.headline}</Text>}
        <View style={styles.contactRow}>
          {data.contact_email && <Text>{data.contact_email}</Text>}
          {data.location && <Text>{data.location}</Text>}
        </View>

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
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>
                    {job.title} · {job.company}
                  </Text>
                  <Text style={styles.entryDates}>
                    {formatDateRange(job.start_date, job.end_date, job.is_current)}
                  </Text>
                </View>
                {job.location && <Text style={styles.entrySubtitle}>{job.location}</Text>}
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
                {project.summary && <Text style={styles.entrySubtitle}>{project.summary}</Text>}
                {project.tech_stack.length > 0 && (
                  <Text style={{ fontSize: 9, color: "#666666", marginTop: 1 }}>
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

        {data.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  )
}
