import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { postJson } from '../api';
import { type LiveData, type MatchCard } from '../types';
import { Card, EmptyState, MiniCard, Pill, PrimaryButton, Row, SecondaryButton, Stat, styles } from '../ui';

type TicketPurchaseResponse = {
  reference: string;
  matchId: string;
  matchTitle: string;
  amount: string;
  quantity: number;
  status: string;
  message: string;
};

export function HubScreen({
  data,
  selectedMatch,
  loading,
  error,
  onRetryCatalog,
  onChangeMatch,
  onChangeEvent,
}: {
  data: LiveData | null;
  selectedMatch: MatchCard | null;
  loading: boolean;
  error: string | null;
  onRetryCatalog: () => void;
  onChangeMatch: () => void;
  onChangeEvent: () => void;
}) {
  const hero = selectedMatch;
  const [ticket, setTicket] = useState<TicketPurchaseResponse | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  const topAlert = useMemo(() => {
    const corridor = data?.traffic?.[0];
    if (!corridor) return null;
    return `${corridor.corridor}: ${corridor.status} — ${corridor.recommendation}`;
  }, [data]);

  const buyTicket = async () => {
    if (!hero) return;
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
          <Text style={styles.kicker}>MATCHDAY HUB</Text>
          <Text style={styles.title}>{hero ? `${hero.homeTeam} vs ${hero.awayTeam}` : 'Matchday mobility hub'}</Text>
          <Text style={styles.subtitle}>{hero ? `${hero.city} · ${hero.venue}` : 'Select a match to load the live journey, operations and gate data.'}</Text>
        </View>

        {topAlert ? (
          <Card title="Live service alert" subtitle="Traffic" wide>
            <EmptyState icon="warning-outline" title="High congestion detected" subtitle={topAlert} />
            <View style={styles.ctaRow}>
              <SecondaryButton label="Open map" onPress={onChangeMatch} icon={<Ionicons name="map-outline" size={16} color="#1d3fb3" />} />
            </View>
          </Card>
        ) : null}

        {error ? (
          <Card title="Catalog unavailable" subtitle="Backend sync">
            <EmptyState icon="cloud-offline-outline" title="Live catalog did not load" subtitle={error} />
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
              <Pill subtle>{hero.stage}</Pill>
            </View>
            <Text style={styles.cardKicker}>Next sporting event</Text>
            <Text style={styles.cardTitle}>{hero.homeFlag} {hero.homeTeam} vs {hero.awayFlag} {hero.awayTeam}</Text>
            <Text style={styles.muted}>{hero.venue} · {hero.city}, {hero.country}</Text>
            <View style={styles.statsRow}>
              <Stat label="Kickoff" value={hero.time} />
              <Stat label="Countdown" value={hero.countdown} />
              <Stat label="Weather" value={`${hero.weather} · ${hero.temperature}`} />
            </View>
            <View style={styles.statsRow}>
              <Stat label="Gate" value={hero.gate} />
              <Stat label="Sector" value={hero.sector} />
              <Stat label="Ticket" value={hero.ticketPrice} />
            </View>
            <Text style={styles.muted}>{hero.transitSummary}</Text>
            <View style={styles.ctaRow}>
              <PrimaryButton label="Plan my journey" onPress={onChangeMatch} icon={<Ionicons name="map-outline" size={16} color="#fff" />} />
              <SecondaryButton label={ticketLoading ? 'Processing...' : 'Buy ticket'} onPress={buyTicket} icon={<Ionicons name="ticket-outline" size={16} color="#1d3fb3" />} />
              <SecondaryButton label="Change match" onPress={onChangeMatch} icon={<Ionicons name="swap-horizontal-outline" size={16} color="#1d3fb3" />} />
            </View>
          </View>
        ) : null}

        <Card title="Ticket purchase" subtitle="Payments" wide>
          {ticket ? (
            <View style={styles.cardBody}>
              <Row leftTitle={ticket.reference} leftSubtitle={ticket.matchTitle} rightTitle={ticket.amount} rightSubtitle={ticket.status} />
              <Text style={styles.muted}>{ticket.message}</Text>
            </View>
          ) : ticketError ? (
            <EmptyState icon="card-outline" title="Ticket checkout unavailable" subtitle={ticketError} />
          ) : (
            <EmptyState icon="card-outline" title="Ready to pay" subtitle="A backend checkout session will appear here once the ticket endpoint is connected to a payment provider." />
          )}
        </Card>

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

        <Card title="Stadium perimeter gates" subtitle="Wayfinding" wide>
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

        <Card title="Matchday essentials" subtitle="Quick access">
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

        <Card title="Operational signals" subtitle="Live recommendations">
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

        <Card title="Contextual messages" subtitle="Adaptive comms">
          {data ? data.contextualMessages.map((item) => (
            <Row key={item.message} leftTitle={item.audience} leftSubtitle={`${item.channel} · ${item.timing}`} rightTitle={item.message} rightSubtitle="Message" />
          )) : <EmptyState icon="chatbubbles-outline" title="No contextual messaging" subtitle="The message queue is populated by the backend catalog." />}
        </Card>

        <Card title="Change selection" subtitle="Navigation" wide>
          <View style={styles.ctaRow}>
            <SecondaryButton label="Change match" onPress={onChangeMatch} icon={<Ionicons name="swap-horizontal-outline" size={16} color="#1d3fb3" />} />
            <SecondaryButton label="Change event" onPress={onChangeEvent} icon={<Ionicons name="grid-outline" size={16} color="#1d3fb3" />} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
