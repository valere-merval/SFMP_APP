import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { postJson } from '../api';
import { type LiveData } from '../types';
import { Card, EmptyState, MiniCard, Pill, PrimaryButton, Row, SecondaryButton, Stat, styles } from '../ui';

type Briefing = {
  model: string;
  summary: string;
  confidence: string;
  recommendations: string[];
};

export function HubScreen({
  data,
  loading,
  error,
  onRetryCatalog,
}: {
  data: LiveData | null;
  loading: boolean;
  error: string | null;
  onRetryCatalog: () => void;
}) {
  const hero = data?.events[0] ?? null;
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const result = await postJson<Briefing>('/api/v1/intelligence/analyze', {
        focus: 'matchday demand and routing',
        context: 'Madrid stadium operations, traffic, gates, and post-match departures',
      });
      setBriefing(result);
    } catch {
      setBriefing(null);
      setBriefingError('AI briefing is unavailable until the backend intelligence service is reachable.');
    } finally {
      setBriefingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SMART FAN MOBILITY</Text>
          <Text style={styles.title}>Smart fan mobility for matchday travel</Text>
          <Text style={styles.subtitle}>One product surface for fans, mobility operations and platform administration.</Text>
        </View>

        {error ? (
          <Card title="Catalog unavailable" subtitle="Backend sync">
            <EmptyState
              icon="cloud-offline-outline"
              title="Live catalog did not load"
              subtitle={error}
            />
            <PrimaryButton label="Retry catalog" onPress={onRetryCatalog} icon={<Ionicons name="refresh-outline" size={16} color="#fff" />} />
          </Card>
        ) : loading && !hero ? (
          <Card title="Loading live catalog" subtitle="Backend sync">
            <EmptyState icon="sync-outline" title="Waiting for live data" subtitle="The app is loading catalog data directly from the backend." />
          </Card>
        ) : hero ? (
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
              <PrimaryButton label="Plan my journey" onPress={() => undefined} icon={<Ionicons name="map-outline" size={16} color="#fff" />} />
              <SecondaryButton label="View event details" onPress={() => undefined} icon={<Ionicons name="document-text-outline" size={16} color="#1d3fb3" />} />
            </View>
          </View>
        ) : null}

        <Card title="Transit direct lines" subtitle="Matchday routing" wide>
          {data ? (
            <View style={styles.grid2}>
              {data.mobility.map((item) => (
                <MiniCard key={item.id} title={item.mode} subtitle={item.badge} meta={`${item.duration} · ${item.price}`} />
              ))}
            </View>
          ) : (
            <EmptyState icon="bus-outline" title="No route catalog yet" subtitle="Transit options will render once the backend returns live mobility data." />
          )}
        </Card>

        <Card title="Perimeter live telemetry" subtitle="Operations feed">
          {data ? data.operations.map((item) => (
            <Row key={item.id} leftTitle={item.label} leftSubtitle={item.trend} rightTitle={item.value} rightSubtitle="Live" />
          )) : <EmptyState icon="pulse-outline" title="No operations feed" subtitle="Live telemetry is pulled from the backend catalog." />}
        </Card>

        <Card title="Delivery roadmap" subtitle="Versions" wide>
          {data ? data.roadmap.map((item) => (
            <Row key={item.version} leftTitle={`${item.version} · ${item.title}`} leftSubtitle={item.features.join(' • ')} rightTitle={item.features.length.toString()} rightSubtitle="Features" />
          )) : <EmptyState icon="layers-outline" title="No roadmap loaded" subtitle="The roadmap section waits for backend data instead of local fixtures." />}
        </Card>

        <Card title="Intelligence feed" subtitle="Version 3">
          {data ? (
            <>
              {data.heatmaps.map((item) => (
                <Row key={item.zone} leftTitle={item.zone} leftSubtitle={`${item.intensity} · ${item.trend}`} rightTitle={item.recommendation} rightSubtitle="Heatmap" />
              ))}
              {data.demandPeaks.map((item) => (
                <Row key={item.window} leftTitle={item.window} leftSubtitle={item.level} rightTitle={item.action} rightSubtitle="Peak" />
              ))}
            </>
          ) : (
            <EmptyState icon="flame-outline" title="No intelligence feed" subtitle="Crowd and demand insights load from backend endpoints only." />
          )}
        </Card>

        <Card title="Traffic and consent" subtitle="Version 2">
          {data ? (
            <>
              {data.traffic.map((item) => (
                <Row key={item.corridor} leftTitle={item.corridor} leftSubtitle={`${item.status} · ${item.impact}`} rightTitle={item.recommendation} rightSubtitle="Traffic" />
              ))}
              {data.consents.map((item) => (
                <Row key={item.source} leftTitle={item.source} leftSubtitle={item.lastUpdated} rightTitle={item.status} rightSubtitle="Consent" />
              ))}
            </>
          ) : (
            <EmptyState icon="shield-checkmark-outline" title="No traffic or consent data" subtitle="These sections read from live backend records only." />
          )}
        </Card>

        <Card title="Model insights" subtitle="ML predictions">
          {data ? data.insights.map((item) => (
            <Row key={item.model} leftTitle={`${item.model} · ${item.confidence}`} leftSubtitle={item.insight} rightTitle={item.action} rightSubtitle="AI" />
          )) : <EmptyState icon="analytics-outline" title="No model insights" subtitle="The AI insights feed comes from the backend." />}
        </Card>

        <Card title="AI briefing" subtitle="OpenAI">
          <View style={styles.cardBody}>
            {briefing ? (
              <>
                <Row leftTitle={`${briefing.model} · ${briefing.confidence}`} leftSubtitle={briefing.summary} rightTitle="Live" rightSubtitle="AI" />
                {briefing.recommendations.map((item) => (
                  <Row key={item} leftTitle={item} leftSubtitle="Recommendation" rightTitle="Action" rightSubtitle="AI" />
                ))}
              </>
            ) : briefingError ? (
              <EmptyState icon="chatbubble-ellipses-outline" title="Briefing unavailable" subtitle={briefingError} />
            ) : (
              <EmptyState icon="sparkles-outline" title="Generate an AI briefing" subtitle="Uses backend intelligence when the service is configured." />
            )}
          </View>
          <View style={styles.ctaRow}>
            <PrimaryButton label={briefingLoading ? 'Analyzing...' : 'Generate AI briefing'} onPress={generateBriefing} icon={<Ionicons name="sparkles-outline" size={16} color="#fff" />} />
          </View>
        </Card>

        <Card title="Contextual messages" subtitle="Adaptive comms">
          {data ? data.contextualMessages.map((item) => (
            <Row key={item.message} leftTitle={item.audience} leftSubtitle={`${item.channel} · ${item.timing}`} rightTitle={item.message} rightSubtitle="Message" />
          )) : <EmptyState icon="chatbubbles-outline" title="No contextual messaging" subtitle="The message queue is populated by the backend catalog." />}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
