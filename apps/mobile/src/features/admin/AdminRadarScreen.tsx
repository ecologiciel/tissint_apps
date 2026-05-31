import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { ArrowRight, CheckCircle, RefreshCw, Send, ShieldAlert, XCircle } from "lucide-react-native";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import {
  listAdminRadar,
  listAuditLogs,
  rejectAdminListing,
  releaseAdminListing,
  reserveAdminListing,
} from "@/lib/api";
import { t } from "@/i18n";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { scoreToPercent, type AdminRadarListing, type AuditLogEntry } from "@tissint/shared";

export function AdminRadarScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const [items, setItems] = useState<AdminRadarListing[]>([]);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (role !== "admin") return;
    setLoading(true);
    setError(null);
    try {
      const [radarItems, auditItems] = await Promise.all([listAdminRadar(), listAuditLogs()]);
      setItems(radarItems);
      setAudit(auditItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur radar admin");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runAction(
    listing: AdminRadarListing,
    action: "reserve" | "release" | "reject",
  ) {
    setActionId(`${action}:${listing.listingId}`);
    setError(null);
    try {
      const reason = `radar_admin_${action}`;
      const result =
        action === "reserve"
          ? await reserveAdminListing(listing.listingId, { reason })
          : action === "release"
            ? await releaseAdminListing(listing.listingId, { reason })
            : await rejectAdminListing(listing.listingId, { reason });
      setItems((current) =>
        current.map((item) =>
          item.listingId === result.listing.listingId ? result.listing : item,
        ),
      );
      setAudit(await listAuditLogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action admin impossible");
    } finally {
      setActionId(null);
    }
  }

  if (role !== "admin") {
    return (
      <Screen>
        <Card style={styles.center}>
          <ShieldAlert color={colors.warning} size={34} />
          <AppText variant="subtitle">Acces admin requis</AppText>
          <Button onPress={() => router.back()}>Retour</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Button tone="ghost" icon={ArrowRight} onPress={() => router.back()}>
          Retour
        </Button>
        <View style={styles.title}>
          <AppText variant="hero" color={colors.navy}>
            {t("admin.radar")}
          </AppText>
          <AppText variant="caption">{items.length} alertes sous controle admin</AppText>
        </View>
      </View>

      {error ? (
        <Card style={styles.notice}>
          <ShieldAlert color={colors.danger} size={24} />
          <AppText variant="body" color={colors.danger}>
            {error}
          </AppText>
        </Card>
      ) : null}

      <Button tone="ghost" icon={RefreshCw} onPress={refresh} loading={loading}>
        Rafraichir
      </Button>

      {loading && items.length === 0 ? (
        <Card style={styles.center}>
          <ActivityIndicator color={colors.orange} />
        </Card>
      ) : null}

      {!loading && items.length === 0 ? (
        <Card style={styles.center}>
          <ShieldAlert color={colors.orange} size={34} />
          <AppText variant="subtitle">Aucune alerte rare active</AppText>
        </Card>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item) => (
          <RadarCard
            key={item.listingId}
            item={item}
            actionId={actionId}
            onAction={runAction}
          />
        ))}

        {audit.length > 0 ? (
          <View style={styles.audit}>
            <AppText variant="subtitle" color={colors.navy}>
              Audit recent
            </AppText>
            {audit.slice(0, 5).map((entry) => (
              <Card key={entry.id} style={styles.auditCard}>
                <AppText variant="caption">{entry.action}</AppText>
                <AppText variant="body" numberOfLines={1}>
                  {entry.entityId}
                </AppText>
                <AppText variant="caption">{new Date(entry.createdAt).toLocaleString()}</AppText>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function RadarCard({
  item,
  actionId,
  onAction,
}: {
  item: AdminRadarListing;
  actionId: string | null;
  onAction: (item: AdminRadarListing, action: "reserve" | "release" | "reject") => void;
}) {
  const statusTone =
    item.status === "published"
      ? "success"
      : item.status === "rejected"
        ? "danger"
        : item.status === "admin_reserved"
          ? "premium"
          : "warning";
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Badge label={item.status} tone={statusTone} />
        <AppText variant="title" color={colors.navy} numberOfLines={2}>
          {item.title}
        </AppText>
      </View>

      <View style={styles.metaGrid}>
        <Metric label="Classe" value={item.dominantClass} />
        <Metric label="Score" value={`${scoreToPercent(item.confidence)}%`} />
        <Metric label="Region" value={item.region ?? "-"} />
        <Metric label="Vendeur" value={item.sellerName ?? item.sellerMaskedName ?? "-"} />
      </View>

      {item.description ? (
        <AppText variant="body" numberOfLines={3}>
          {item.description}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        <Button
          tone="dark"
          icon={CheckCircle}
          loading={actionId === `reserve:${item.listingId}`}
          disabled={item.status === "admin_reserved"}
          onPress={() => onAction(item, "reserve")}
        >
          Reserver
        </Button>
        <Button
          tone="secondary"
          icon={Send}
          loading={actionId === `release:${item.listingId}`}
          disabled={item.status === "published"}
          onPress={() => onAction(item, "release")}
        >
          Publier
        </Button>
        <Button
          tone="danger"
          icon={XCircle}
          loading={actionId === `reject:${item.listingId}`}
          disabled={item.status === "rejected"}
          onPress={() => onAction(item, "reject")}
        >
          Rejeter
        </Button>
      </View>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    alignItems: "flex-end",
  },
  center: {
    alignItems: "center",
    gap: spacing.md,
  },
  notice: {
    alignItems: "center",
    gap: spacing.sm,
  },
  list: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  metaGrid: {
    gap: spacing.sm,
  },
  metric: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    alignItems: "flex-end",
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  audit: {
    gap: spacing.sm,
  },
  auditCard: {
    gap: spacing.xs,
  },
});
