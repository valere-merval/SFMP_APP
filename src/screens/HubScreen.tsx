import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { postJson } from '../api';
import { getScreenCopy } from '../screenCopy';
import type { LiveData, MatchCard } from '../types';
import { Card, EmptyState, MiniCard, Pill, PrimaryButton, Row, SecondaryButton, Stat, styles } from '../ui';
import { trackTelemetry } from '../telemetry';
import type { Locale } from '../i18n';

type TicketPurchaseResponse = {
  reference: string;
  matchId: string;
  matchTitle: string;
  amount: string;
  quantity: number;
  status: string;
  message: string;
};

function isImageUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function FlagBadge({ value, title }: { value: string; title: string }) {
  if (isImageUrl(value)) {
    return <Image source={{ uri: value }} style={localStyles.flagImage} accessibilityLabel={title} />;
  }

  return <Text style={localStyles.flagText}>{value}</Text>;
}

function formatCountdown(date: string, time: string) {
  const target = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);
  if (Number.isNaN(target.getTime())) {
    return 'LIVE';
  }

  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return 'LIVE';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function HubScreen({
  data,
  selectedMatch,
  locale,
  loading,
  error,
  onRetryCatalog,
  onChangeMatch,
  onChangeEvent,
}: {
  data: LiveData | null;
  selectedMatch: MatchCard | null;
  locale: Locale;
  loading: boolean;
  error: string | null;
  onRetryCatalog: () => void;
  onChangeMatch: () => void;
  onChangeEvent: () => void;
}) {
  const copy = getScreenCopy(locale).hub;
  const hero = selectedMatch;
  const [ticket, setTicket] = useState<TicketPurchaseResponse | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [countdown, setCountdown] = useState(() => (hero ? formatCountdown(hero.date, hero.time) : 'LIVE'));

  useEffect(() => {
    if (!hero) {
      setCountdown('LIVE');
      return;
    }

    const refresh = () => setCountdown(formatCountdown(hero.date, hero.time));
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [hero, hero?.date, hero?.time]);

  const topAlert = useMemo(() => {
    const corridor = data?.traffic?.[0];
    if (!corridor) return null;
    return `${corridor.corridor}: ${corridor.status} — ${corridor.recommendation}`;
  }, [data]);

  const buyTicket = async () => {
    if (!hero) return;
    trackTelemetry('ticket_checkout_started', 'Hub', { matchId: hero.id, title: `${hero.homeTeam} vs ${hero.awayTeam}` });
    setTicketLoading(true);
    setTicketError(null);
    try {
      const response = await postJson<TicketPurchaseResponse>('/api/v1/tickets/purchase', {
        matchId: hero.id,
        quantity: 1,
        paymentMethod: 'card',
      });
      setTicket(response);
    } catch {
      setTicket(null);
      setTicketError('Ticket checkout could not be created. Try again once the backend payment flow is available.');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{hero ? `${hero.homeTeam} vs ${hero.awayTeam}` : copy.emptyTitle}</Text>
          <Text style={styles.subtitle}>{hero ? `${hero.city} · ${hero.venue}` : copy.emptySubtitle}</Text>
        </View>

        {topAlert ? (
          <Card title={copy.alertTitle} subtitle={copy.alertSubtitle} wide>
            <EmptyState icon="warning-outline" title={copy.highCongestion} subtitle={topAlert} />
            <View style={styles.ctaRow}>
              <SecondaryButton label={copy.changeMatch} onPress={onChangeMatch} icon={<Ionicons name="map-outline" size={16} color="#1d3fb3" />} />
            </View>
          </Card>
        ) : null}

        {error ? (
          <Card title="Catalog unavailable" subtitle="Backend sync">
            <EmptyState icon="cloud-offline-outline" title="Live catalog did not load" subtitle={error} />
            <PrimaryButton label={copy.retryCatalog} onPress={onRetryCatalog} icon={<Ionicons name="refresh-outline" size={16} color="#fff" />} />
          </Card>
        ) : loading && !hero ? (
          <Card title={copy.loadingTitle} subtitle={copy.loadingSubtitle}>
            <EmptyState icon="sync-outline" title={copy.loadingTitle} subtitle="The app is loading catalog data directly from the backend." />
          </Card>
        ) : hero ? (
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <Pill>{hero.status}</Pill>
              <Pill subtle>{hero.stage}</Pill>
              {hero.ticketAvailable ? <Pill subtle>Tickets live</Pill> : null}
            </View>
            <Text style={styles.cardKicker}>{copy.nextEvent}</Text>
            <View style={localStyles.flagRow}>
              <FlagBadge value={hero.homeFlag} title={hero.homeTeam} />
              <Text style={localStyles.teamLine} numberOfLines={1} ellipsizeMode="tail">
                {hero.homeTeam} vs {hero.awayTeam}
              </Text>
              <FlagBadge value={hero.awayFlag} title={hero.awayTeam} />
            </View>
            <Text style={styles.muted}>{hero.venue} · {hero.city}, {hero.country}</Text>
            <View style={styles.statsRow}>
              <Stat label={copy.kickoff} value={hero.time} />
              <Stat label={copy.countdown} value={countdown} />
              <Stat label={copy.weather} value={`${hero.weather} · ${hero.temperature}`} />
            </View>
            <View style={styles.statsRow}>
              <Stat label={copy.gate} value={hero.gate} />
              <Stat label={copy.sector} value={hero.sector} />
              <Stat label={copy.ticket} value={hero.ticketAvailable ? hero.ticketPrice || 'Available' : 'N/A'} />
            </View>
            <Text style={styles.muted}>{hero.transitSummary}</Text>
            <View style={styles.ctaRow}>
              <PrimaryButton label={copy.planJourney} onPress={() => { trackTelemetry('plan_journey_clicked', 'Hub', { matchId: hero.id }); onChangeMatch(); }} icon={<Ionicons name="map-outline" size={16} color="#fff" />} />
              {hero.ticketAvailable ? <SecondaryButton label={ticketLoading ? 'Processing...' : 'Ticket kaufen'} onPress={buyTicket} icon={<Ionicons name="ticket-outline" size={16} color="#1d3fb3" />} /> : null}
              <SecondaryButton label={copy.changeMatch} onPress={() => { trackTelemetry('change_match_clicked', 'Hub', { matchId: hero.id }); onChangeMatch(); }} icon={<Ionicons name="swap-horizontal-outline" size={16} color="#1d3fb3" />} />
            </View>
          </View>
        ) : null}

        <Card title={copy.ticketTitle} subtitle={copy.ticketSubtitle} wide>
          {ticket ? (
            <View style={styles.cardBody}>
              <Row leftTitle={ticket.reference} leftSubtitle={ticket.matchTitle} rightTitle={ticket.amount} rightSubtitle={ticket.status} />
              <Text style={styles.muted}>{ticket.message}</Text>
            </View>
          ) : ticketError ? (
            <EmptyState icon="card-outline" title="Ticket checkout unavailable" subtitle={ticketError} />
          ) : (
            <EmptyState icon="card-outline" title={copy.readyToPayTitle} subtitle={copy.readyToPayBody} />
          )}
        </Card>

        <Card title={copy.linesTitle} subtitle={copy.linesSubtitle} wide>
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

        <Card title={copy.telemetryTitle} subtitle={copy.telemetrySubtitle}>
          {data ? data.operations.map((item) => (
            <Row key={item.id} leftTitle={item.label} leftSubtitle={item.trend} rightTitle={item.value} rightSubtitle="Live" />
          )) : <EmptyState icon="pulse-outline" title="No operations feed" subtitle="Live telemetry is pulled from the backend catalog." />}
        </Card>

        <Card title={copy.gatesTitle} subtitle={copy.gatesSubtitle} wide>
          <View style={styles.cardBody}>
            {hero ? (
              <>
                <Row leftTitle={hero.gate} leftSubtitle={hero.sector} rightTitle="Open" rightSubtitle="Access" />
                <Row leftTitle="North Esplanade" leftSubtitle="4 min queue" rightTitle="Guide" rightSubtitle="Route" />
                <Row leftTitle="Reserved fan lane" leftSubtitle="Accessible access" rightTitle="Ready" rightSubtitle="Access" />
              </>
            ) : (
              <EmptyState icon="map-outline" title="No gate data yet" subtitle="Select a match to render the live gate and wayfinding panel." />
            )}
          </View>
        </Card>

        <Card title={copy.essentialsTitle} subtitle={copy.essentialsSubtitle}>
          {hero ? (
            <View style={styles.grid2}>
              <MiniCard title="Locker P3" subtitle="A4 max size" meta="Quick drop-off" />
              <MiniCard title="Parking P4" subtitle="78 spots left" meta="Reserved access" />
              <MiniCard title="Fan zones" subtitle="Plaza Mayor" meta="Food and meet-up" />
              <MiniCard title="Ride-hailing" subtitle="South VTC zone" meta="Pick-up ready" />
            </View>
          ) : (
            <EmptyState icon="compass-outline" title="No essentials yet" subtitle="This panel is filled from the selected match and backend data." />
          )}
        </Card>

        <Card title={copy.signalsTitle} subtitle={copy.signalsSubtitle}>
          {data ? (
            <>
              {data.traffic.map((item) => (
                <Row key={item.corridor} leftTitle={item.corridor} leftSubtitle={`${item.status} · ${item.impact}`} rightTitle={item.recommendation} rightSubtitle="Traffic" />
              ))}
              {data.routeAdaptations.map((item) => (
                <Row key={item.corridor} leftTitle={item.corridor} leftSubtitle={item.reason} rightTitle={item.change} rightSubtitle="Route" />
              ))}
            </>
          ) : (
            <EmptyState icon="navigate-outline" title="No live signals" subtitle="Traffic and route recommendations are loaded from backend data only." />
          )}
        </Card>

        <Card title={copy.messagesTitle} subtitle={copy.messagesSubtitle}>
          {data ? data.contextualMessages.map((item) => (
            <Row key={item.message} leftTitle={item.audience} leftSubtitle={`${item.channel} · ${item.timing}`} rightTitle={item.message} rightSubtitle="Message" />
          )) : <EmptyState icon="chatbubbles-outline" title="No contextual messaging" subtitle="The message queue is populated by the backend catalog." />}
        </Card>

        <Card title={copy.changeSelectionTitle} subtitle={copy.changeSelectionSubtitle} wide>
          <View style={styles.ctaRow}>
            <SecondaryButton label={copy.changeMatch} onPress={onChangeMatch} icon={<Ionicons name="swap-horizontal-outline" size={16} color="#1d3fb3" />} />
            <SecondaryButton label="Change event" onPress={onChangeEvent} icon={<Ionicons name="grid-outline" size={16} color="#1d3fb3" />} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = {
  flagRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    marginBottom: 8,
    flexWrap: 'nowrap' as const,
  },
  flagImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#edf2ff',
  },
  flagText: {
    width: 28,
    textAlign: 'center' as const,
    color: '#172033',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  vsAccent: {
    color: '#c8f36a',
    fontFamily: 'Poppins-ExtraBold',
  },
  teamLine: {
    flexShrink: 1,
    minWidth: 0,
    color: '#172033',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center' as const,
  },
  teamName: {
    color: '#172033',
    fontFamily: 'Poppins-ExtraBold',
  },
};
