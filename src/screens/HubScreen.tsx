import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import MapboxNaviView from '../components/MapboxNaviView';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { acceptRideRequest, createRideRequest, getRideRequest, getSessionUser, getAuthToken, listAssignedDriverRideRequests, listDriverRideRequests, listPassengerRideRequests, listPublicTransportProfiles, loadTransportAvailability, markRideRequestArrived, postJson, refuseRideRequest, startRideRequestTrip, completeRideRequestTrip } from '../api';
import { getScreenCopy } from '../screenCopy';
import type { LiveData, MatchCard } from '../types';
import { Card, EmptyState, PrimaryButton, Row, SecondaryButton, styles } from '../ui';
import { trackTelemetry } from '../telemetry';
import { buildRideRouteCoordinates, rideStatusStyle } from '../maps';
import { t, type Locale } from '../i18n';
import { loadVoiceGuidanceEnabled, saveVoiceGuidanceEnabled, speakVoiceGuidance, stopVoiceGuidance } from '../voice';

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

const hubSectionCopy = {
  en: {
    signalsHint: 'Traffic + reroutes stay readable while you scroll.',
    messagesHint: 'Live fan messages adapt to the match context.',
    signalsPill: 'Live traffic',
    messagesPill: 'Context aware',
  },
  fr: {
    signalsHint: 'Les signaux de trafic et de détour restent lisibles pendant le scroll.',
    messagesHint: 'Les messages fans s’adaptent au contexte du match.',
    signalsPill: 'Trafic en direct',
    messagesPill: 'Contexte adaptatif',
  },
  de: {
    signalsHint: 'Verkehr und Umleitungen bleiben beim Scrollen gut lesbar.',
    messagesHint: 'Kontextnachrichten passen sich dem Spiel an.',
    signalsPill: 'Live-Verkehr',
    messagesPill: 'Kontextbezogen',
  },
  es: {
    signalsHint: 'El tráfico y los desvíos siguen claros al desplazarte.',
    messagesHint: 'Los mensajes se adaptan al contexto del partido.',
    signalsPill: 'Tráfico en vivo',
    messagesPill: 'Contexto dinámico',
  },
  pt: {
    signalsHint: 'Trânsito e desvios seguem legíveis durante a rolagem.',
    messagesHint: 'As mensagens se adaptam ao contexto da partida.',
    signalsPill: 'Tráfego ao vivo',
    messagesPill: 'Contexto adaptável',
  },
  ar: {
    signalsHint: 'يبقى المرور والتحويلات واضحين أثناء التمرير.',
    messagesHint: 'تتكيف رسائل المشجعين مع سياق المباراة.',
    signalsPill: 'حركة مباشرة',
    messagesPill: 'سياق متكيف',
  },
  zh: {
    signalsHint: '滚动时，交通与绕行信息依然清晰可读。',
    messagesHint: '球迷消息会随比赛情境自动调整。',
    signalsPill: '实时交通',
    messagesPill: '情境自适应',
  },
  ru: {
    signalsHint: 'Поток и объезды остаются читаемыми при прокрутке.',
    messagesHint: 'Сообщения для фанатов подстраиваются под контекст матча.',
    signalsPill: 'Живой трафик',
    messagesPill: 'Контекстно',
  },
} as const;

const hubLiveRotationCopy = {
  en: {
    signals: [
      { tag: 'Roadworks', title: 'North access lane reduced', detail: 'Expect slower arrivals near Gate B for the next 15 min.' },
      { tag: 'Event flow', title: 'Shuttle priority active', detail: 'Use the dedicated lane for faster boarding to the stadium.' },
      { tag: 'Traffic pulse', title: 'Crowd surge after warm-up', detail: 'Main boulevard density is increasing; allow extra time.' },
    ],
    messages: [
      { tag: 'Fans', title: 'Meet-up reminder', detail: 'Supporters heading from the center should regroup at the plaza.' },
      { tag: 'Ride', title: 'Driver arrival update', detail: 'Your matched driver is 6 min away and sending live route updates.' },
      { tag: 'Match day', title: 'Gate guidance', detail: 'Keep your ticket ready; gate staff are routing arrivals by sector.' },
    ],
  },
  fr: {
    signals: [
      { tag: 'Travaux', title: 'Voie d’accès nord réduite', detail: 'Prévoir un peu plus de temps près de la porte B pendant 15 min.' },
      { tag: 'Flux', title: 'Priorité navette active', detail: 'Utilise la voie dédiée pour embarquer plus vite vers le stade.' },
      { tag: 'Trafic', title: 'Pic de foule après l’échauffement', detail: 'Le boulevard principal se densifie, laisse une marge.' },
    ],
    messages: [
      { tag: 'Fans', title: 'Rappel du point de rendez-vous', detail: 'Les supporters venant du centre doivent se regrouper sur la place.' },
      { tag: 'Trajet', title: 'Mise à jour chauffeur', detail: 'Ton chauffeur est à 6 min et envoie le suivi live.' },
      { tag: 'Jour de match', title: 'Consigne portes', detail: 'Garde ton billet prêt, les arrivées sont orientées par secteur.' },
    ],
  },
  de: {
    signals: [
      { tag: 'Baustelle', title: 'Nordzufahrt verengt', detail: 'Rund um Tor B ist in den nächsten 15 Min. mehr Zeit einzuplanen.' },
      { tag: 'Ablauf', title: 'Shuttle-Vorrang aktiv', detail: 'Nutze die Sonderspur für schnelleres Boarding zum Stadion.' },
      { tag: 'Verkehr', title: 'Publikumsanstieg nach dem Warm-up', detail: 'Die Hauptstraße wird dichter; bitte etwas Puffer einplanen.' },
    ],
    messages: [
      { tag: 'Fans', title: 'Treffpunkt-Erinnerung', detail: 'Supporter aus der Innenstadt sollen sich am Platz sammeln.' },
      { tag: 'Fahrt', title: 'Fahrer-Update', detail: 'Dein Fahrer ist in 6 Min. da und teilt Live-Routenupdates.' },
      { tag: 'Spieltag', title: 'Torhinweis', detail: 'Ticket bereithalten; das Personal leitet Ankünfte nach Sektor.' },
    ],
  },
  es: {
    signals: [
      { tag: 'Obras', title: 'Carril norte reducido', detail: 'Calcula más tiempo cerca de la puerta B durante 15 min.' },
      { tag: 'Flujo', title: 'Prioridad de shuttle activa', detail: 'Usa el carril dedicado para embarcar antes hacia el estadio.' },
      { tag: 'Tráfico', title: 'Aumento tras el calentamiento', detail: 'La avenida principal se está llenando; deja margen.' },
    ],
    messages: [
      { tag: 'Fans', title: 'Recordatorio de encuentro', detail: 'Los aficionados del centro deben reunirse en la plaza.' },
      { tag: 'Viaje', title: 'Actualización del conductor', detail: 'Tu conductor está a 6 min y comparte seguimiento en vivo.' },
      { tag: 'Partido', title: 'Guía de puertas', detail: 'Ten tu entrada lista; el acceso se está dirigiendo por sector.' },
    ],
  },
  pt: {
    signals: [
      { tag: 'Obras', title: 'Faixa norte reduzida', detail: 'Considere mais tempo perto do portão B pelos próximos 15 min.' },
      { tag: 'Fluxo', title: 'Prioridade de shuttle ativa', detail: 'Use a faixa dedicada para embarque mais rápido ao estádio.' },
      { tag: 'Tráfego', title: 'Pico após o aquecimento', detail: 'A via principal está ficando mais cheia; reserve margem.' },
    ],
    messages: [
      { tag: 'Fans', title: 'Lembrete do ponto de encontro', detail: 'Torcedores do centro devem se reunir na praça.' },
      { tag: 'Viagem', title: 'Atualização do motorista', detail: 'Seu motorista está a 6 min e envia o trajeto ao vivo.' },
      { tag: 'Jogo', title: 'Orientação de portões', detail: 'Mantenha o ingresso pronto; as chegadas estão sendo direcionadas por setor.' },
    ],
  },
  ar: {
    signals: [
      { tag: 'أعمال', title: 'المسار الشمالي أضيق الآن', detail: 'توقع تأخيرًا بسيطًا قرب البوابة B خلال 15 دقيقة.' },
      { tag: 'تدفق', title: 'أولوية النقل السريع مفعّلة', detail: 'استخدم المسار المخصص للصعود الأسرع نحو الملعب.' },
      { tag: 'ازدحام', title: 'زيادة بعد الإحماء', detail: 'الشارع الرئيسي يزداد ازدحامًا؛ اترك وقتًا إضافيًا.' },
    ],
    messages: [
      { tag: 'المشجعون', title: 'تذكير بنقطة اللقاء', detail: 'المشجعون القادمون من الوسط يجتمعون في الساحة.' },
      { tag: 'الرحلة', title: 'تحديث السائق', detail: 'سائقك على بعد 6 دقائق ويرسل التتبع المباشر.' },
      { tag: 'يوم المباراة', title: 'إرشاد البوابات', detail: 'احتفظ بالتذكرة جاهزة؛ تتم توجيه الدخول حسب القطاع.' },
    ],
  },
  zh: {
    signals: [
      { tag: '施工', title: '北侧通道缩减', detail: '未来 15 分钟，B 门附近请预留更多时间。' },
      { tag: '流程', title: '接驳优先通道已开启', detail: '请走专用通道，更快前往体育场。' },
      { tag: '交通', title: '热身后人流上升', detail: '主干道拥挤度正在增加，请预留缓冲时间。' },
    ],
    messages: [
      { tag: '球迷', title: '集合提醒', detail: '从市中心出发的球迷请在广场集合。' },
      { tag: '行程', title: '司机更新', detail: '你的司机还有 6 分钟，并会发送实时路线。' },
      { tag: '比赛日', title: '入口指引', detail: '请准备好门票；现场会按区域引导入场。' },
    ],
  },
  ru: {
    signals: [
      { tag: 'Работы', title: 'Северный проезд сужен', detail: 'Около ворот B в ближайшие 15 минут будет медленнее.' },
      { tag: 'Поток', title: 'Приоритет шаттлов включён', detail: 'Используйте выделенную полосу для более быстрого посадочного потока.' },
      { tag: 'Трафик', title: 'После разминки поток вырос', detail: 'Основная магистраль загружена — закладывайте запас.' },
    ],
    messages: [
      { tag: 'Фанаты', title: 'Напоминание о встрече', detail: 'Болельщикам из центра нужно собраться на площади.' },
      { tag: 'Поездка', title: 'Обновление по водителю', detail: 'Ваш водитель будет через 6 минут и отправляет live-маршрут.' },
      { tag: 'Матч', title: 'Подсказка по воротам', detail: 'Держите билет под рукой; вход распределяется по секторам.' },
    ],
  },
} as const;

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

type Coordinate = { latitude: number; longitude: number };

const fallbackCoordinate: Coordinate | null = null;

function getCurrentCoordinates(): Promise<Coordinate | null> {
  const geolocation = (globalThis as typeof globalThis & {
    navigator?: { geolocation?: { getCurrentPosition: Function } };
  }).navigator?.geolocation;

  if (!geolocation?.getCurrentPosition) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    geolocation.getCurrentPosition(
      (position: { coords?: { latitude?: number; longitude?: number } }) => {
        const latitude = position.coords?.latitude;
        const longitude = position.coords?.longitude;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
          resolve({ latitude, longitude });
          return;
        }
        resolve(null);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );
  });
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
  currentLocation,
}: {
  data: LiveData | null;
  selectedMatch: MatchCard | null;
  locale: Locale;
  loading: boolean;
  error: string | null;
  onRetryCatalog: () => void;
  onChangeMatch: () => void;
  onChangeEvent: () => void;
  currentLocation: Coordinate | null;
}) {
  const copy = getScreenCopy(locale).hub;
  const hubCopy = hubSectionCopy[locale];
  const hero = selectedMatch;
  const [ticket, setTicket] = useState<TicketPurchaseResponse | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [countdown, setCountdown] = useState(() => (hero ? formatCountdown(hero.date, hero.time) : 'LIVE'));
  const baseTransportProviders = useMemo(() => data?.transportProviders ?? [], [data?.transportProviders]);
  const [liveTransportProviders, setLiveTransportProviders] = useState(baseTransportProviders);
  const [requestMode, setRequestMode] = useState<'Taxi' | 'VTC'>('VTC');
  const [requestDestination, setRequestDestination] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [rideRequest, setRideRequest] = useState<import('../types').RideRequestView | null>(null);
  const [driverRequests, setDriverRequests] = useState<import('../types').RideRequestView[]>([]);
  const [driverRequestsLoading, setDriverRequestsLoading] = useState(false);
  const [driverAvailability, setDriverAvailability] = useState<import('../types').TransportAvailabilityView | null>(null);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [rotationIndex, setRotationIndex] = useState(0);
  const lastVoiceSummaryRef = useRef('');
  const isDriver = driverAvailability?.available === true;
  const destinationOptions = useMemo(
    () => (hero ? [hero.venue, hero.gate, hero.sector].filter(Boolean) : []),
    [hero],
  );

  const driverRequestProviderTypes = useMemo(() => {
    const seen = new Set<string>();
    return liveTransportProviders
      .map((provider) => provider.providerType?.trim())
      .filter((providerType): providerType is string => Boolean(providerType))
      .filter((providerType) => /taxi|vtc|chauffeur|driver/i.test(providerType))
      .flatMap((providerType) => [providerType, 'Taxi/VTC'])
      .filter((providerType) => {
        if (seen.has(providerType)) return false;
        seen.add(providerType);
        return true;
      });
  }, [liveTransportProviders]);

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

  useEffect(() => {
    let mounted = true;
    loadVoiceGuidanceEnabled().then((enabled) => {
      if (mounted) {
        setVoiceGuidanceEnabled(enabled);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setRotationIndex(0);
    const timer = setInterval(() => {
      setRotationIndex((current) => (current + 1) % 3);
    }, 30000);

    return () => clearInterval(timer);
  }, [locale]);

  const activeSignalsNote = hubLiveRotationCopy[locale].signals[rotationIndex % hubLiveRotationCopy[locale].signals.length];
  const activeMessagesNote = hubLiveRotationCopy[locale].messages[rotationIndex % hubLiveRotationCopy[locale].messages.length];

  const rideVoiceSummary = useMemo(() => {
    if (!rideRequest) {
      return '';
    }

    const parts = [
      rideRequest.status ? rideStatusStyle(rideRequest.status, locale).label : null,
      rideRequest.passengerName,
      rideRequest.pickupLabel,
      rideRequest.destinationLabel,
      rideRequest.driverDisplayName,
      rideRequest.driverVehiclePlate,
      rideRequest.driverDistanceKm != null ? `${rideRequest.driverDistanceKm} km` : null,
      rideRequest.driverEtaMinutes != null ? `${rideRequest.driverEtaMinutes} min` : null,
    ].filter((part): part is string => Boolean(part));

    return parts.join(' · ');
  }, [locale, rideRequest]);

  useEffect(() => {
    const summary = rideVoiceSummary;
    if (!summary) {
      stopVoiceGuidance();
      lastVoiceSummaryRef.current = '';
      return;
    }

    if (!voiceGuidanceEnabled) {
      stopVoiceGuidance();
      return;
    }

    if (lastVoiceSummaryRef.current === summary) {
      return;
    }

    lastVoiceSummaryRef.current = summary;
    speakVoiceGuidance(summary, locale);
  }, [locale, rideVoiceSummary, voiceGuidanceEnabled]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const live = await listPublicTransportProfiles(hero?.id);
        if (!mounted) return;
        setLiveTransportProviders(live);
      } catch {
        if (!mounted) return;
        setLiveTransportProviders(baseTransportProviders);
      }
    };
    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [hero?.id, baseTransportProviders]);

  const toggleVoiceGuidance = () => {
    const nextEnabled = !voiceGuidanceEnabled;
    setVoiceGuidanceEnabled(nextEnabled);
    saveVoiceGuidanceEnabled(nextEnabled);
    if (!nextEnabled) {
      stopVoiceGuidance();
      return;
    }

    const summary = rideVoiceSummary;
    if (summary) {
      speakVoiceGuidance(summary, locale);
    }
  };

  const rideRequestId = rideRequest?.id;
  const rideRequestStatus = rideRequest?.status;

  useEffect(() => {
    if (!rideRequestId || rideRequestStatus === 'REFUSED') {
      return;
    }

    let mounted = true;
    const refresh = async () => {
      try {
        const live = await getRideRequest(rideRequestId);
        if (!mounted) return;
        setRideRequest(live);
      } catch {
        if (!mounted) return;
      }
    };

    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [rideRequestId, rideRequestStatus]);

  useEffect(() => {
    const passengerEmail = getSessionUser()?.email ?? '';
    if (!passengerEmail) return;

    let mounted = true;
    const refresh = async () => {
      try {
        const live = await listPassengerRideRequests(passengerEmail);
        if (!mounted) return;
        const activeRequest = live.find((request) => request.status !== 'COMPLETED' && request.status !== 'REFUSED') ?? live[0] ?? null;
        if (activeRequest) {
          setRideRequest(activeRequest);
        }
      } catch {
        if (!mounted) return;
      }
    };

    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 7000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!hero) {
      setDriverAvailability(null);
      return;
    }

    let mounted = true;
    const refresh = async () => {
      try {
        const live = await loadTransportAvailability(hero.id);
        if (!mounted) return;
        setDriverAvailability(live);
      } catch {
        if (!mounted) return;
        setDriverAvailability(null);
      }
    };

    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 9000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [hero]);

  useEffect(() => {
    if (!hero || !isDriver) {
      setDriverRequests([]);
      return;
    }
    let mounted = true;
    const refresh = async () => {
      try {
        const providerTypes = driverRequestProviderTypes.length ? driverRequestProviderTypes : ['Taxi', 'VTC'];
        const [pendingBatches, assigned] = await Promise.all([
          Promise.all(providerTypes.map((providerType) => listDriverRideRequests(hero.id, providerType).catch(() => []))),
          getSessionUser()?.email ? listAssignedDriverRideRequests(getSessionUser()!.email) : Promise.resolve([]),
        ]);
        if (!mounted) return;
        const pending = pendingBatches.flat();
        const live = [...pending, ...assigned.filter((request) => request.matchId === hero.id)];
        const deduped = live.filter((request, index, list) => list.findIndex((item) => item.id === request.id) === index);
        setDriverRequests(deduped);
      } catch {
        if (!mounted) return;
        setDriverRequests([]);
      } finally {
        if (mounted) setDriverRequestsLoading(false);
      }
    };
    setDriverRequestsLoading(true);
    refresh();
    const timer = setInterval(() => {
      refresh();
    }, 6000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [hero, isDriver, driverRequestProviderTypes]);

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

  const requestRide = async () => {
    if (!hero) return;
    setRequestLoading(true);
    setRequestError(null);
    setRequestStatus(null);
    try {
      const me = getSessionUser();
      const hasToken = Boolean(getAuthToken());
      if (!me?.email && !hasToken) {
        setRequestError('Sign in again to send a live transport request.');
        setRequestLoading(false);
        return;
      }

      const passengerCoordinates = currentLocation ?? (await getCurrentCoordinates()) ?? undefined;

      const response = await createRideRequest({
        matchId: hero.id,
        matchTitle: `${hero.homeTeam} vs ${hero.awayTeam}`,
        passengerEmail: me?.email,
        passengerName: me?.fullName,
        providerType: 'Taxi/VTC',
        pickupLabel: `${hero.city} · ${t(locale, 'common.liveMap')}`,
        pickupLatitude: passengerCoordinates?.latitude,
        pickupLongitude: passengerCoordinates?.longitude,
        destinationLabel: requestDestination || hero.venue,
        note: `${requestMode} request started from Hub`,
      });
      setRideRequest(response);
      setRequestStatus(t(locale, 'common.requestSent'));
    } catch (caught: any) {
      setRequestError(caught instanceof Error ? caught.message : 'Unable to send the request right now.');
    } finally {
      setRequestLoading(false);
    }
  };

  const ridePickupCoordinate =
    rideRequest?.pickupLatitude != null && rideRequest?.pickupLongitude != null
      ? {
          latitude: rideRequest.pickupLatitude,
          longitude: rideRequest.pickupLongitude,
        }
      : null;
  const rideDriverCoordinate =
    rideRequest?.driverLatitude != null && rideRequest?.driverLongitude != null
      ? {
          latitude: rideRequest.driverLatitude,
          longitude: rideRequest.driverLongitude,
        }
      : null;
  const rideDestinationCoordinate =
    rideRequest?.destinationLatitude != null && rideRequest?.destinationLongitude != null
      ? {
          latitude: rideRequest.destinationLatitude,
          longitude: rideRequest.destinationLongitude,
        }
      : null;
  const liveRouteOrigin =
    rideRequest?.status === 'IN_PROGRESS'
      ? rideDriverCoordinate ?? ridePickupCoordinate ?? currentLocation ?? null
      : rideDriverCoordinate ?? ridePickupCoordinate ?? currentLocation ?? null;
  const liveRouteDestination =
    rideRequest?.status === 'IN_PROGRESS'
      ? rideDestinationCoordinate ?? ridePickupCoordinate ?? currentLocation ?? null
      : rideRequest?.status === 'ACCEPTED' || rideRequest?.status === 'ARRIVED_AT_PICKUP'
        ? ridePickupCoordinate ?? rideDestinationCoordinate ?? currentLocation ?? null
        : rideDestinationCoordinate ?? ridePickupCoordinate ?? currentLocation ?? null;
  const liveRoute = buildRideRouteCoordinates(
    rideRequest?.status === 'IN_PROGRESS'
      ? rideDriverCoordinate
      : rideRequest?.status === 'ACCEPTED' || rideRequest?.status === 'ARRIVED_AT_PICKUP'
        ? rideDriverCoordinate ?? ridePickupCoordinate
        : ridePickupCoordinate,
    liveRouteDestination,
  );

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>{copy.eyebrow}</Text>
          <Text style={styles.title}>
            {hero ? `${hero.homeTeam} vs ${hero.awayTeam}` : copy.emptyTitle}
          </Text>
          <Text style={styles.subtitle}>
            {hero ? `${hero.city} · ${hero.venue}` : copy.emptySubtitle}
          </Text>
        </View>

        {isDriver ? (
          <View style={localStyles.dispatchPanel}>
            <View style={localStyles.dispatchTopRow}>
              <View style={localStyles.dispatchKicker}>
                <View style={localStyles.dispatchDot} />
                <Text style={localStyles.dispatchKickerText}>{t(locale, 'common.live')}</Text>
              </View>
              <View style={localStyles.dispatchLivePill}>
                <Text style={localStyles.dispatchLiveText}>{driverRequests.length ? `${driverRequests.length} ${t(locale, 'common.live')}` : t(locale, 'common.available')}</Text>
              </View>
            </View>
            <Text style={localStyles.dispatchTitle}>
              DISPATCH CHAUFFEUR LIVE
            </Text>
            <Text style={localStyles.dispatchSubtitle} numberOfLines={2}>
              {hero ? `${hero.homeTeam} vs ${hero.awayTeam} · ${hero.venue}` : copy.eyebrow}
            </Text>
            <View style={localStyles.dispatchStatsRow}>
              <View style={localStyles.dispatchStatCard}>
                <Text style={localStyles.dispatchStatValue}>{driverRequests.length}</Text>
                <Text style={localStyles.dispatchStatLabel}>{t(locale, 'common.passengerRequests')}</Text>
              </View>
              <View style={localStyles.dispatchStatCard}>
                <Text style={localStyles.dispatchStatValue}>{rideRequest?.status ? rideStatusStyle(rideRequest.status, locale).label : t(locale, 'common.available')}</Text>
                <Text style={localStyles.dispatchStatLabel}>{t(locale, 'common.live')}</Text>
              </View>
              <View style={localStyles.dispatchStatCard}>
                <Text style={localStyles.dispatchStatValue}>{voiceGuidanceEnabled ? 'ON' : 'OFF'}</Text>
                <Text style={localStyles.dispatchStatLabel}>VOICE</Text>
              </View>
              <View style={localStyles.dispatchStatCard}>
                <Text style={localStyles.dispatchStatValue}>{hero ? countdown.toUpperCase() : 'LIVE'}</Text>
                <Text style={localStyles.dispatchStatLabel}>{t(locale, 'common.scheduled')}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {topAlert ? (
          <Card title={copy.alertTitle} subtitle={copy.alertSubtitle} wide>
            <EmptyState
              icon="warning-outline"
              title={copy.highCongestion}
              subtitle={topAlert}
            />
            <View style={styles.ctaRow}>
              <SecondaryButton
                label={copy.changeMatch}
                onPress={onChangeMatch}
                icon={<Ionicons name="map-outline" size={16} color="#22d3ee" />}
              />
            </View>
          </Card>
        ) : null}

        {error ? (
          <Card
            title={t(locale, 'common.backendUnavailable')}
            subtitle={t(locale, 'common.loadingSession')}
          >
            <EmptyState
              icon="cloud-offline-outline"
              title={t(locale, 'common.backendUnavailable')}
              subtitle={error}
            />
            <PrimaryButton
              label={copy.retryCatalog}
              onPress={onRetryCatalog}
              icon={<Ionicons name="refresh-outline" size={16} color="#fff" />}
            />
          </Card>
        ) : loading && !hero ? (
          <Card title={copy.loadingTitle} subtitle={copy.loadingSubtitle}>
            <EmptyState
              icon="sync-outline"
              title={copy.loadingTitle}
              subtitle={t(locale, 'common.loadingSession')}
            />
          </Card>
        ) : hero ? (
          <View style={localStyles.ticketCard}>
            <View style={localStyles.chipsRow}>
              <View
                style={[localStyles.statusChip, localStyles.statusChipDark]}
              >
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={localStyles.statusChipTextDark}>
                  {t(locale, 'common.scheduled')}
                </Text>
              </View>
              <View style={localStyles.statusChip}>
                <Text style={localStyles.statusChipText}>
                  {t(locale, 'common.finale')}
                </Text>
              </View>
              <View style={localStyles.statusChip}>
                <Text style={localStyles.statusChipText}>
                  {t(locale, 'common.ticketsLive')}
                </Text>
              </View>
            </View>

            <Text style={localStyles.sectionLabel}>{copy.nextEvent}</Text>

            <View style={localStyles.matchHeader}>
              <View style={localStyles.teamBlock}>
                <View style={localStyles.logoWrap}>
                  <FlagBadge value={hero.homeFlag} title={hero.homeTeam} />
                </View>
                <Text
                  style={localStyles.teamName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {hero.homeTeam}
                </Text>
                <Text style={localStyles.teamRole}>
                  {t(locale, 'common.home')}
                </Text>
              </View>

              <View style={localStyles.vsPill}>
                <Text style={localStyles.vsText}>vs</Text>
              </View>

              <View style={localStyles.teamBlockRight}>
                <View style={localStyles.logoWrap}>
                  <FlagBadge value={hero.awayFlag} title={hero.awayTeam} />
                </View>
                <Text
                  style={localStyles.teamName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {hero.awayTeam}
                </Text>
                <Text style={localStyles.teamRole}>
                  {t(locale, 'common.away')}
                </Text>
              </View>
            </View>

            <Text style={localStyles.venueText}>
              {hero.venue} · {hero.city}, {hero.country}
            </Text>
            <Text style={localStyles.countdownLine}>
              COUNTDOWN {countdown.toUpperCase()}
            </Text>

            <View style={localStyles.tileGrid}>
              <InfoTile label={copy.kickoff} value={hero.time} />
              <InfoTile
                label={copy.weather}
                value={`${hero.weather} · ${hero.temperature}`}
                wide
              />
              <InfoTile label={copy.gate} value={hero.gate} />
              <InfoTile label={copy.sector} value={hero.sector} />
              <InfoTile
                label={copy.ticket}
                value={
                  hero.ticketAvailable ? hero.ticketPrice || 'Available' : 'N/A'
                }
                valueAccent={hero.ticketAvailable}
              />
            </View>

            <Text style={localStyles.transitLine}>{hero.transitSummary}</Text>

            <View style={localStyles.actionRow}>
              <Pressable
                onPress={() => {
                  trackTelemetry('plan_journey_clicked', 'Hub', {
                    matchId: hero.id,
                  });
                  onChangeMatch();
                }}
                style={localStyles.primaryAction}
              >
                <Text style={localStyles.primaryActionText}>
                  {copy.planJourney}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#f8fafc" />
              </Pressable>
              <Pressable
                onPress={buyTicket}
                style={localStyles.secondaryAction}
              >
                <Ionicons name="qr-code-outline" size={16} color="#06B6D4" />
                <Text style={localStyles.secondaryActionText}>
                  {ticketLoading
                    ? t(locale, 'common.processing')
                    : t(locale, 'common.gatePass')}
                </Text>
              </Pressable>
            </View>

            {isDriver ? (
              <View style={localStyles.quickRequestCard}>
                <Text style={localStyles.sectionLabel}>
                  {t(locale, 'common.passengerRequests')}
                </Text>
                <Text style={localStyles.quickRequestText}>
                  {t(locale, 'common.driverRequestsSubtitle')}
                </Text>
                {driverRequestsLoading ? (
                  <Text numberOfLines={2} style={localStyles.mapOverlayText}>
                    {t(locale, 'common.loading')}
                  </Text>
                ) : driverRequests.length ? (
                  driverRequests.map(request => {
                    const requestRideStatus = rideStatusStyle(request.status, locale);
                    return (
                      <View key={request.id} style={localStyles.requestCard}>
                        <View style={localStyles.requestTopRow}>
                          <View style={localStyles.requestPassengerWrap}>
                            <View style={localStyles.requestAvatar}>
                              <Text style={localStyles.requestAvatarText}>
                                {(request.passengerName || 'P').slice(0, 1).toUpperCase()}
                              </Text>
                            </View>
                            <View style={localStyles.requestHeaderCopy}>
                              <Text style={localStyles.mapOverlayTitle} numberOfLines={1}>
                                {request.passengerName}
                              </Text>
                              <Text numberOfLines={1} style={localStyles.mapOverlayText}>
                                {request.pickupLabel}
                              </Text>
                            </View>
                          </View>
                          <View style={localStyles.requestStatusPill}>
                            <Text style={localStyles.requestStatusPillText}>{requestRideStatus.label}</Text>
                          </View>
                        </View>
                        <Text numberOfLines={2} style={localStyles.requestRouteText}>
                          {request.pickupLabel} → {request.destinationLabel}
                        </Text>
                        <View style={localStyles.requestMetaRow}>
                          {request.driverDistanceKm != null ? (
                            <View style={localStyles.requestMetaChip}>
                              <Text style={localStyles.requestMetaChipText}>{request.driverDistanceKm} km</Text>
                            </View>
                          ) : null}
                          {request.driverEtaMinutes != null ? (
                            <View style={localStyles.requestMetaChip}>
                              <Text style={localStyles.requestMetaChipText}>{request.driverEtaMinutes} min</Text>
                            </View>
                          ) : null}
                          {request.driverVehiclePlate ? (
                            <View style={localStyles.requestMetaChip}>
                              <Text style={localStyles.requestMetaChipText}>{request.driverVehiclePlate}</Text>
                            </View>
                          ) : null}
                        </View>
                        {request.status === 'PENDING' ? (
                          <View style={styles.ctaRow}>
                            <SecondaryButton
                              label={t(locale, 'common.refuse')}
                              onPress={() => {
                                refuseRideRequest(request.id);
                              }}
                            />
                            <PrimaryButton
                              label={t(locale, 'common.accept')}
                              onPress={async () => {
                                const driverCoordinates = currentLocation ?? (await getCurrentCoordinates());
                                if (!driverCoordinates) {
                                  setRequestError(t(locale, 'common.locationRequired'));
                                  return;
                                }
                                acceptRideRequest(request.id, {
                                  driverLatitude: driverCoordinates.latitude,
                                  driverLongitude: driverCoordinates.longitude,
                                })
                                  .then(accepted => {
                                    setDriverRequests(current =>
                                      current.map(item =>
                                        item.id === accepted.id ? accepted : item,
                                      ),
                                    );
                                    setRideRequest(accepted);
                                    setRequestStatus(
                                      `${accepted.passengerName}${
                                        accepted.driverDisplayName ? ` · ${accepted.driverDisplayName}` : ''
                                      }${
                                        accepted.driverVehiclePlate ? ` · ${accepted.driverVehiclePlate}` : ''
                                      }${
                                        accepted.driverDistanceKm != null
                                          ? ` · ${accepted.driverDistanceKm} km`
                                          : ''
                                      }${
                                        accepted.driverEtaMinutes != null
                                          ? ` · ${accepted.driverEtaMinutes} min`
                                          : ''
                                      }`,
                                    );
                                  });
                              }}
                              icon={
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#f8fafc"
                                />
                              }
                            />
                          </View>
                        ) : request.status === 'ACCEPTED' ? (
                          <View style={styles.ctaRow}>
                            <SecondaryButton
                              label={t(locale, 'common.arrived')}
                              onPress={() => {
                                markRideRequestArrived(request.id);
                              }}
                            />
                            <PrimaryButton
                              label={t(locale, 'common.startTrip')}
                              onPress={() => {
                                startRideRequestTrip(request.id);
                              }}
                              icon={
                                <Ionicons
                                  name="navigate-circle-outline"
                                  size={16}
                                  color="#f8fafc"
                                />
                              }
                            />
                          </View>
                        ) : request.status === 'ARRIVED_AT_PICKUP' ? (
                          <View style={styles.ctaRow}>
                            <SecondaryButton
                              label={t(locale, 'common.passengerBoarded')}
                              onPress={() => {
                                startRideRequestTrip(request.id);
                              }}
                            />
                            <PrimaryButton
                              label={t(locale, 'common.startTrip')}
                              onPress={() => {
                                startRideRequestTrip(request.id);
                              }}
                              icon={
                                <Ionicons
                                  name="navigate-circle-outline"
                                  size={16}
                                  color="#f8fafc"
                                />
                              }
                            />
                          </View>
                        ) : request.status === 'IN_PROGRESS' ? (
                          <View style={styles.ctaRow}>
                            <SecondaryButton
                              label={t(locale, 'common.completeTrip')}
                              onPress={() => {
                                completeRideRequestTrip(request.id);
                              }}
                            />
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                ) : (
                  <EmptyState
                    icon="car-sport-outline"
                    title={t(locale, 'common.noLiveReservation')}
                    subtitle={t(locale, 'common.liveTracking')}
                  />
                )}
              </View>
            ) : (
              <View style={localStyles.quickRequestCard}>
                <Text style={localStyles.sectionLabel}>
                  {t(locale, 'common.instantBooking')}
                </Text>
                <Text style={localStyles.quickRequestText}>
                  {t(locale, 'common.liveTracking')}
                </Text>
                <View style={localStyles.destinationRow}>
                  {destinationOptions.map(destination => {
                    const selected =
                      destination === requestDestination ||
                      (!requestDestination && destination === hero.venue);
                    return (
                      <Pressable
                        key={destination}
                        onPress={() => setRequestDestination(destination)}
                        style={[
                          localStyles.destinationChip,
                          selected && localStyles.destinationChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            localStyles.destinationChipText,
                            selected && localStyles.destinationChipTextActive,
                          ]}
                        >
                          {destination}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.ctaRow}>
                  <SecondaryButton
                    label={t(locale, 'journey.taxiLabel')}
                    onPress={() => setRequestMode('Taxi')}
                    icon={
                      <Ionicons name="car-outline" size={16} color="#22d3ee" />
                    }
                  />
                  <SecondaryButton
                    label={t(locale, 'journey.vtcLabel')}
                    onPress={() => setRequestMode('VTC')}
                    icon={
                      <Ionicons
                        name="car-sport-outline"
                        size={16}
                        color="#22d3ee"
                      />
                    }
                  />
                </View>
                <PrimaryButton
                  label={
                    requestLoading
                      ? t(locale, 'common.processing')
                      : t(locale, 'common.reserveNow')
                  }
                  onPress={requestRide}
                  icon={
                    <Ionicons name="send-outline" size={16} color="#f8fafc" />
                  }
                />
                {requestStatus ? (
                  <Text style={localStyles.requestSuccess}>
                    {requestStatus}
                  </Text>
                ) : null}
                {requestError ? (
                  <Text style={localStyles.requestError}>{requestError}</Text>
                ) : null}
              </View>
            )}
            <View style={localStyles.mapPanel}>
              <MapboxNaviView
                height={800}
                origin={liveRouteOrigin}
                destination={liveRouteDestination}
                route={liveRoute}
                title={
                  rideRequest
                    ? rideRequest.status === 'IN_PROGRESS'
                      ? rideRequest.passengerName
                      : rideRequest.status === 'ACCEPTED' || rideRequest.status === 'ARRIVED_AT_PICKUP'
                        ? rideRequest.passengerName
                        : rideRequest.destinationLabel
                    : requestDestination || hero.venue
                }
                subtitle={
                  rideRequest
                    ? rideRequest.status === 'IN_PROGRESS'
                      ? `${rideRequest.pickupLabel} → ${rideRequest.destinationLabel}`
                      : rideRequest.status === 'ACCEPTED' || rideRequest.status === 'ARRIVED_AT_PICKUP'
                        ? `${rideRequest.driverDisplayName || t(locale, 'common.driver')} · ${rideRequest.driverVehiclePlate || ''}`.trim()
                        : `${rideRequest.pickupLabel} → ${rideRequest.destinationLabel}`
                    : `${hero.city}, ${hero.country}`
                }
                liveLabel={
                  rideRequest
                    ? rideStatusStyle(rideRequest?.status, locale).label
                    : t(locale, 'common.pickupTracking')
                }
              />
              <View style={localStyles.mapOverlay}>
                <View style={styles.rowBetween}>
                  <View style={localStyles.mapOverlayContent}>
                    <Text style={localStyles.mapOverlayTitle}>
                      {rideRequest
                        ? rideRequest.status === 'IN_PROGRESS'
                          ? rideRequest.destinationLabel
                          : rideRequest.status === 'ACCEPTED' || rideRequest.status === 'ARRIVED_AT_PICKUP'
                            ? rideRequest.passengerName
                            : rideRequest.destinationLabel
                        : requestDestination || hero.venue}
                    </Text>
                    <Text numberOfLines={1} style={localStyles.mapOverlayText}>
                      {rideRequest
                        ? rideRequest.status === 'PENDING'
                          ? `${t(locale, 'common.requestPending')} · ${rideRequest.pickupLabel}`
                          : rideRequest.status === 'ACCEPTED'
                            ? `${t(locale, 'common.requestAccepted')} · ${rideRequest.driverDisplayName || ''}${
                                rideRequest.driverVehiclePlate ? ` · ${rideRequest.driverVehiclePlate}` : ''
                              }`
                            : rideRequest.status === 'IN_PROGRESS'
                              ? `${t(locale, 'common.requestInProgress')} · ${rideRequest.driverDisplayName || ''}${
                                  rideRequest.driverVehiclePlate ? ` · ${rideRequest.driverVehiclePlate}` : ''
                                }`
                              : t(locale, 'common.requestRefused')
                        : t(locale, 'common.pickupTracking')}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={voiceGuidanceEnabled ? 'Mute voice guidance' : 'Enable voice guidance'}
                    onPress={toggleVoiceGuidance}
                    style={({ pressed }) => [
                      localStyles.voiceButton,
                      voiceGuidanceEnabled ? localStyles.voiceButtonActive : localStyles.voiceButtonInactive,
                      pressed && localStyles.voiceButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name={voiceGuidanceEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
                      size={18}
                      color={voiceGuidanceEnabled ? '#c8f36a' : '#fff'}
                    />
                  </Pressable>
                </View>
                <View style={localStyles.mapOverlayWrap}>
                  {rideRequest?.driverDisplayName ? (
                    <View style={localStyles.mapBadge}>
                      <Text style={localStyles.mapBadgeText}>{rideRequest.driverDisplayName}</Text>
                    </View>
                  ) : null}
                  {rideRequest?.driverVehiclePlate ? (
                    <View style={localStyles.mapBadge}>
                      <Text style={localStyles.mapBadgeText}>{rideRequest.driverVehiclePlate}</Text>
                    </View>
                  ) : null}
                  {rideRequest?.driverDistanceKm != null || rideRequest?.driverEtaMinutes != null ? (
                    <View style={localStyles.mapBadge}>
                      <Text style={localStyles.mapBadgeText}>
                        {rideRequest.driverDistanceKm != null ? `${rideRequest.driverDistanceKm} km` : t(locale, 'common.loading')} · {rideRequest.driverEtaMinutes != null ? `${rideRequest.driverEtaMinutes} min` : t(locale, 'common.loading')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <Card title={copy.ticketTitle} subtitle={copy.ticketSubtitle} wide>
          {ticket ? (
            <View style={styles.cardBody}>
              <Row
                leftTitle={ticket.reference}
                leftSubtitle={ticket.matchTitle}
                rightTitle={ticket.amount}
                rightSubtitle={ticket.status}
              />
              <Text style={styles.muted}>{ticket.message}</Text>
            </View>
          ) : ticketError ? (
            <EmptyState
              icon="card-outline"
              title={t(locale, 'common.backendUnavailable')}
              subtitle={ticketError}
            />
          ) : (
            <EmptyState
              icon="card-outline"
              title={copy.readyToPayTitle}
              subtitle={copy.readyToPayBody}
            />
          )}
        </Card>

        {/*<Card*/}
        {/*  title={t(locale, 'common.registeredOperators')}*/}
        {/*  subtitle={`${t(locale, 'journey.taxiLabel')} · ${t(*/}
        {/*    locale,*/}
        {/*    'journey.vtcLabel',*/}
        {/*  )}`}*/}
        {/*  wide*/}
        {/*>*/}
        {/*  {liveTransportProviders.length ? (*/}
        {/*    <View style={styles.grid2}>*/}
        {/*      {liveTransportProviders.map(provider => (*/}
        {/*        <MiniCard*/}
        {/*          key={provider.id}*/}
        {/*          title={provider.displayName}*/}
        {/*          subtitle={`${provider.providerType} · ${provider.zone}`}*/}
        {/*          meta={`${provider.vehicleLabel} · ${provider.status}`}*/}
        {/*        />*/}
        {/*      ))}*/}
        {/*    </View>*/}
        {/*  ) : (*/}
        {/*    <EmptyState*/}
        {/*      icon="car-sport-outline"*/}
        {/*      title={t(locale, 'common.noOperatorsRegistered')}*/}
        {/*      subtitle={t(locale, 'common.backendUnavailable')}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*</Card>*/}

        {/*<Card title={copy.telemetryTitle} subtitle={copy.telemetrySubtitle}>*/}
        {/*  {data ? (*/}
        {/*    data.operations.map(item => (*/}
        {/*      <Row*/}
        {/*        key={item.id}*/}
        {/*        leftTitle={item.label}*/}
        {/*        leftSubtitle={item.trend}*/}
        {/*        rightTitle={item.value}*/}
        {/*        rightSubtitle={t(locale, 'common.live')}*/}
        {/*      />*/}
        {/*    ))*/}
        {/*  ) : (*/}
        {/*    <EmptyState*/}
        {/*      icon="pulse-outline"*/}
        {/*      title={t(locale, 'common.noOperationsFeed')}*/}
        {/*      subtitle={t(locale, 'common.backendUnavailable')}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*</Card>*/}

        <Card title={copy.gatesTitle} subtitle={copy.gatesSubtitle} wide>
          <View style={styles.cardBody}>
            {hero ? (
              <>
                <Row
                  leftTitle={hero.gate}
                  leftSubtitle={hero.sector}
                  rightTitle={t(locale, 'common.live')}
                  rightSubtitle={t(locale, 'common.destination')}
                />
                {/*<Row*/}
                {/*  leftTitle="North Esplanade"*/}
                {/*  leftSubtitle="4 min queue"*/}
                {/*  rightTitle={t(locale, 'common.navigation')}*/}
                {/*  rightSubtitle={t(locale, 'common.destination')}*/}
                {/*/>*/}
                {/*<Row*/}
                {/*  leftTitle="Reserved fan lane"*/}
                {/*  leftSubtitle="Accessible access"*/}
                {/*  rightTitle={t(locale, 'common.available')}*/}
                {/*  rightSubtitle={t(locale, 'common.destination')}*/}
                {/*/>*/}
              </>
            ) : (
              <EmptyState
                icon="map-outline"
                title={t(locale, 'common.noGateData')}
                subtitle={t(locale, 'common.selectMatchFirstBody')}
              />
            )}
          </View>
        </Card>

        {/*<Card title={copy.essentialsTitle} subtitle={copy.essentialsSubtitle}>*/}
        {/*  {hero ? (*/}
        {/*    <View style={styles.grid2}>*/}
        {/*      <MiniCard*/}
        {/*        title="Locker P3"*/}
        {/*        subtitle="A4 max size"*/}
        {/*        meta="Quick drop-off"*/}
        {/*      />*/}
        {/*      <MiniCard*/}
        {/*        title="Parking P4"*/}
        {/*        subtitle="78 spots left"*/}
        {/*        meta="Reserved access"*/}
        {/*      />*/}
        {/*      <MiniCard*/}
        {/*        title="Fan zones"*/}
        {/*        subtitle="Plaza Mayor"*/}
        {/*        meta="Food and meet-up"*/}
        {/*      />*/}
        {/*      <MiniCard*/}
        {/*        title={t(locale, 'common.registeredOperators')}*/}
        {/*        subtitle={t(locale, 'common.noOperatorsRegistered')}*/}
        {/*        meta={`${t(locale, 'journey.taxiLabel')} · ${t(*/}
        {/*          locale,*/}
        {/*          'journey.vtcLabel',*/}
        {/*        )}`}*/}
        {/*      />*/}
        {/*    </View>*/}
        {/*  ) : (*/}
        {/*    <EmptyState*/}
        {/*      icon="compass-outline"*/}
        {/*      title={t(locale, 'common.noEssentials')}*/}
        {/*      subtitle={t(locale, 'common.backendUnavailable')}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*</Card>*/}

        <Card title={copy.signalsTitle} subtitle={copy.signalsSubtitle}>
          <View style={localStyles.sectionNote}>
            <Text style={localStyles.sectionHint}>{hubCopy.signalsHint}</Text>
            <View style={localStyles.rotationCard}>
              <View style={localStyles.rotationChip}><Text style={localStyles.rotationChipText}>{activeSignalsNote.tag}</Text></View>
              <Text style={localStyles.rotationTitle}>{activeSignalsNote.title}</Text>
              <Text style={localStyles.rotationDetail}>{activeSignalsNote.detail}</Text>
            </View>
            <View style={localStyles.localePillsRow}>
              <View style={localStyles.localePill}><Text style={localStyles.localePillText}>{hubCopy.signalsPill}</Text></View>
              <View style={localStyles.localePillSecondary}><Text style={localStyles.localePillSecondaryText}>{copy.signalsSubtitle}</Text></View>
            </View>
          </View>
          {data ? (
            <>
              {data.traffic.map(item => (
                <Row
                  key={item.corridor}
                  leftTitle={item.corridor}
                  leftSubtitle={`${item.status} · ${item.impact}`}
                  rightTitle={item.recommendation}
                  rightSubtitle={t(locale, 'common.live')}
                />
              ))}
              {data.routeAdaptations.map(item => (
                <Row
                  key={item.corridor}
                  leftTitle={item.corridor}
                  leftSubtitle={item.reason}
                  rightTitle={item.change}
                  rightSubtitle={t(locale, 'common.navigation')}
                />
              ))}
            </>
          ) : (
            <EmptyState
              icon="navigate-outline"
              title={t(locale, 'common.noLiveSignals')}
              subtitle={t(locale, 'common.backendUnavailable')}
            />
          )}
        </Card>

        <Card title={copy.messagesTitle} subtitle={copy.messagesSubtitle}>
          <View style={localStyles.sectionNote}>
            <Text style={localStyles.sectionHint}>{hubCopy.messagesHint}</Text>
            <View style={localStyles.rotationCard}>
              <View style={localStyles.rotationChip}><Text style={localStyles.rotationChipText}>{activeMessagesNote.tag}</Text></View>
              <Text style={localStyles.rotationTitle}>{activeMessagesNote.title}</Text>
              <Text style={localStyles.rotationDetail}>{activeMessagesNote.detail}</Text>
            </View>
            <View style={localStyles.localePillsRow}>
              <View style={localStyles.localePill}><Text style={localStyles.localePillText}>{hubCopy.messagesPill}</Text></View>
              <View style={localStyles.localePillSecondary}><Text style={localStyles.localePillSecondaryText}>{copy.messagesSubtitle}</Text></View>
            </View>
          </View>
          {data ? (
            data.contextualMessages.map(item => (
              <Row
                key={item.message}
                leftTitle={item.audience}
                leftSubtitle={`${item.channel} · ${item.timing}`}
                rightTitle={item.message}
                rightSubtitle={t(locale, 'common.navigation')}
              />
            ))
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              title={t(locale, 'common.noContextualMessaging')}
              subtitle={t(locale, 'common.backendUnavailable')}
            />
          )}
        </Card>

        <Card
          title={copy.changeSelectionTitle}
          subtitle={copy.changeSelectionSubtitle}
          wide
        >
          <View style={styles.ctaRow}>
            <SecondaryButton
              label={copy.changeMatch}
              onPress={onChangeMatch}
              icon={
                <Ionicons
                  name="swap-horizontal-outline"
                  size={16}
                  color="#22d3ee"
                />
              }
            />
            <SecondaryButton
              label={t(locale, 'common.changeEvent')}
              onPress={onChangeEvent}
              icon={<Ionicons name="grid-outline" size={16} color="#22d3ee" />}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function InfoTile({ label, value, valueAccent = false, wide = false }: { label: string; value: string; valueAccent?: boolean; wide?: boolean }) {
  return (
    <View style={[localStyles.infoTile, wide && localStyles.infoTileWide]}>
      <Text style={localStyles.infoLabel}>{label}</Text>
      <Text style={[localStyles.infoValue, valueAccent && localStyles.infoValueAccent]} numberOfLines={2}>
        {value}
      </Text>
    </View>
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
    color: '#f8fafc',
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
    color: '#f8fafc',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center' as const,
  },
  ticketCard: {
    padding: 14,
    borderRadius: 28,
    backgroundColor: '#101b2d',
    gap: 16,
    borderWidth: 1,
    borderColor: '#1b2b46',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  dispatchPanel: {
    marginTop: 12,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(7, 12, 24, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.1)',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  dispatchTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  dispatchKicker: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  dispatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c8f36a',
    shadowColor: '#c8f36a',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  dispatchKickerText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  dispatchLivePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.28)',
  },
  dispatchLiveText: {
    color: '#d9ff6f',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  dispatchTitle: {
    color: '#fff',
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 26,
    lineHeight: 30,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  dispatchSubtitle: {
    color: '#cbd5e1',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.92,
  },
  dispatchStatsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  dispatchStatCard: {
    flexGrow: 1,
    minWidth: '46%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  dispatchStatValue: {
    color: '#f8fafc',
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 17,
  },
  dispatchStatLabel: {
    color: '#94a3b8',
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statusChipDark: {
    backgroundColor: '#0d1422',
  },
  statusChipText: {
    color: '#06B6D4',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  statusChipTextDark: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  sectionLabel: {
    color: '#94A3B8',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  sectionNote: {
    gap: 10,
    marginBottom: 12,
  },
  sectionHint: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  rotationCard: {
    gap: 6,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 18, 34, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.12)',
  },
  rotationChip: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(217, 255, 111, 0.14)',
  },
  rotationChipText: {
    color: '#d9ff6f',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    fontFamily: 'Poppins-Bold',
  },
  rotationTitle: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  rotationDetail: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  localePillsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  localePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(203, 213, 225, 0.12)',
  },
  localePillText: {
    color: '#d9ff6f',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  localePillSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  localePillSecondaryText: {
    color: '#cbd5e1',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  matchHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  teamBlock: { flex: 1, alignItems: 'flex-start' as const, gap: 3 },
  teamBlockRight: { flex: 1, alignItems: 'flex-end' as const, gap: 3 },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#16253d',
    marginBottom: 2,
  },
  teamName: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 26,
    fontFamily: 'Poppins-ExtraBold',
  },
  teamRole: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  vsPill: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#06B6D4',
  },
  vsText: {
    color: '#f8fafc',
    fontSize: 18,
    fontFamily: 'Teko',
  },
  venueText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  countdownLine: {
    color: '#c8f36a',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    fontFamily: 'Teko',
  },
  tileGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  infoTile: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 72,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#16253d',
    borderWidth: 1,
    borderColor: '#23395c',
    gap: 4,
  },
  infoTileWide: {
    flexBasis: '48%',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase' as const,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Teko',
  },
  infoValueAccent: {
    color: '#06B6D4',
  },
  transitLine: {
    color: '#d4def0',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },
  actionRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  primaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#17b8d8',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: '#f8fafc',
    fontFamily: 'Oswald-SemiBold',
    fontSize: 12,
    paddingHorizontal: 12,
    letterSpacing: 0.4,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 33, 56, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  quickRequestCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 41, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(35, 57, 92, 0.92)',
    gap: 10,
  },
  quickRequestText: {
    color: '#d7e3ff',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  destinationRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  destinationChip: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2d4062',
    backgroundColor: '#122138',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  destinationChipActive: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
  },
  destinationChipText: {
    color: '#d7e3ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  destinationChipTextActive: {
    color: '#f8fafc',
  },
  requestSuccess: {
    color: '#c8f36a',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  requestError: {
    color: '#ff8a8a',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  mapPanel: {
    marginTop: 18,
    overflow: 'hidden' as const,
    minHeight: 760,
    borderRadius: 30,
    backgroundColor: '#070d18',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.045)',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  mapView: {
    width: '100%',
    height: 660,
  },
  mapOverlay: {
    position: 'absolute' as const,
    left: 8,
    right: 8,
    bottom: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 12, 24, 0.03)',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.03)',
  },
  mapOverlayTitle: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    flexShrink: 1,
  },
  mapOverlayText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    flexShrink: 1,
    maxWidth: '100%',
  },
  mapOverlayContent: {
    flex: 1,
  },
  mapOverlayWrap: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginTop: 8,
  },
  mapBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  mapBadgeText: {
    color: '#d9ff6f',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  requestCard: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  requestTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 10,
  },
  requestPassengerWrap: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    minWidth: 0,
  },
  requestAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(157, 245, 255, 0.16)',
  },
  requestAvatarText: {
    color: '#f8fbff',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  requestHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  requestStatusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(200,243,106,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(200,243,106,0.15)',
  },
  requestStatusPillText: {
    color: '#c8f36a',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  requestRouteText: {
    color: '#e4efff',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  requestMetaRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  requestMetaChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  requestMetaChipText: {
    color: '#9df5ff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(29,63,179,0.14)',
    borderColor: 'rgba(157, 245, 255, 0.18)',
  },
  voiceButtonInactive: {
    backgroundColor: 'rgba(7,12,24,0.24)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  voiceButtonPressed: {
    opacity: 0.7,
  },
};