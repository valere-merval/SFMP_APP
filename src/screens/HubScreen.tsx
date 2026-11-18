import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { postJson } from '../api';
import { type LiveData } from '../types';
import { Card, MiniCard, Pill, PrimaryButton, Row, SecondaryButton, Stat, styles } from '../ui';

export function HubScreen({ data }: { data: LiveData }) {
  const hero = useMemo(() => data.events[0], [data.events]);
  const [briefing, setBriefing] = useState<{ model: string; summary: string; confidence: string; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateBriefing = async () => {
    setLoading(true);
    const result = await postJson('/api/v1/intelligence/analyze', { focus: 'matchday demand and routing', context: 'Madrid stadium operations, traffic, gates, and post-match departures' }, {
      model: 'local-fallback',
      summary: 'AI briefing will appear here once the backend AI key is configured.',
      confidence: '88%',
      recommendations: ['Pre-position shuttles', 'Prioritize crowded corridors', 'Push targeted notifications'],
    });
    setBriefing(result);
    setLoading(false);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Smart fan mobility for matchday travel</Text>
          <Text style={styles.subtitle}>
            One product surface for fans, mobility operations and platform administration.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Pill>{hero.status}</Pill>
            <Pill subtle>LIVE</Pill>
          </View>
          <Text style={styles.cardKicker}>Next sporting event</Text>
          <Text style={styles.cardTitle}>{hero.title}</Text>
          <Text style={styles.muted}>{hero.venue} · {hero.city}</Text>
          <View style={styles.statsRow}>
            <Stat label="Date" value={hero.date} />
            <Stat label="Fans" value={hero.attendance} />
            <Stat label="Gate" value="34 East Hub" />
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label="Plan my journey" onPress={() => undefined} />
            <SecondaryButton label="View event details" onPress={() => undefined} />
          </View>
        </View>

        <Card title="Transit direct lines" subtitle="Matchday routing" wide>
          <View style={styles.grid2}>
            {data.mobility.map((item) => (
              <MiniCard key={item.id} title={item.mode} subtitle={item.badge} meta={`${item.duration} · ${item.price}`} />
            ))}
          </View>
        </Card>

        <Card title="Perimeter live telemetry" subtitle="Operations feed">
          {data.operations.map((item) => (
            <Row key={item.id} leftTitle={item.label} leftSubtitle={item.trend} rightTitle={item.value} rightSubtitle="Live" />
          ))}
        </Card>

        <Card title="Delivery roadmap" subtitle="Versions" wide>
          {data.roadmap.map((item) => (
            <Row key={item.version} leftTitle={`${item.version} · ${item.title}`} leftSubtitle={item.features.join(' • ')} rightTitle={item.features.length.toString()} rightSubtitle="Features" />
          ))}
        </Card>

        <Card title="Intelligence feed" subtitle="Version 3">
          {data.heatmaps.map((item) => (
            <Row key={item.zone} leftTitle={item.zone} leftSubtitle={`${item.intensity} · ${item.trend}`} rightTitle={item.recommendation} rightSubtitle="Heatmap" />
          ))}
          {data.demandPeaks.map((item) => (
            <Row key={item.window} leftTitle={item.window} leftSubtitle={item.level} rightTitle={item.action} rightSubtitle="Peak" />
          ))}
        </Card>

        <Card title="Traffic and consent" subtitle="Version 2">
          {data.traffic.map((item) => (
            <Row key={item.corridor} leftTitle={item.corridor} leftSubtitle={`${item.status} · ${item.impact}`} rightTitle={item.recommendation} rightSubtitle="Traffic" />
          ))}
          {data.consents.map((item) => (
            <Row key={item.source} leftTitle={item.source} leftSubtitle={item.lastUpdated} rightTitle={item.status} rightSubtitle="Consent" />
          ))}
        </Card>

        <Card title="Model insights" subtitle="ML predictions">
          {data.insights.map((item) => (
            <Row key={item.model} leftTitle={`${item.model} · ${item.confidence}`} leftSubtitle={item.insight} rightTitle={item.action} rightSubtitle="AI" />
          ))}
        </Card>

        <Card title="AI briefing" subtitle="OpenAI / fallback">
          <View style={styles.cardBody}>
            {briefing ? (
              <>
                <Row leftTitle={`${briefing.model} · ${briefing.confidence}`} leftSubtitle={briefing.summary} rightTitle="Live" rightSubtitle="AI" />
                {briefing.recommendations.map((item) => (
                  <Row key={item} leftTitle={item} leftSubtitle="Recommendation" rightTitle="Action" rightSubtitle="AI" />
                ))}
              </>
            ) : (
              <Row leftTitle="Generate an AI briefing" leftSubtitle="Use OpenAI gpt-5.3-mini when OPENAI_API_KEY is configured. Falls back locally otherwise." rightTitle={loading ? 'Running...' : 'Ready'} rightSubtitle="AI" />
            )}
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label={loading ? 'Analyzing...' : 'Generate AI briefing'} onPress={generateBriefing} />
          </View>
        </Card>

        <Card title="Contextual messages" subtitle="Adaptive comms">
          {data.contextualMessages.map((item) => (
            <Row key={item.message} leftTitle={item.audience} leftSubtitle={`${item.channel} · ${item.timing}`} rightTitle={item.message} rightSubtitle="Message" />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
