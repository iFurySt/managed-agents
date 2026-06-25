package main

import (
	"testing"
	"time"
)

func TestSeedSessionsMatchesSourceCreatedLabels(t *testing.T) {
	sessions, _ := seedSessions(time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC))

	want := map[string]string{
		"sesn_01MwRxWt4Enabbz8a2Vk66M7": "Jun 18",
		"sesn_01DpRMTNY1P3gNrELQEXitXN": "Jun 18",
	}
	for _, session := range sessions {
		if label, ok := want[session.ID]; ok && session.CreatedLabel != label {
			t.Fatalf("session %s created label = %q, want %q", session.ID, session.CreatedLabel, label)
		}
	}
}

func TestSeedRuntimeRowsReferenceSeededEnvironments(t *testing.T) {
	now := time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC)
	environments := seedEnvironments(now)
	environmentIDs := make(map[string]bool, len(environments))
	for _, environment := range environments {
		environmentIDs[environment.ID] = true
	}

	deployments, _ := seedDeployments(now)
	for _, deployment := range deployments {
		if !environmentIDs[deployment.EnvironmentID] {
			t.Fatalf("deployment %s references unknown environment %s", deployment.ID, deployment.EnvironmentID)
		}
	}

	sessions, _ := seedSessions(now)
	for _, session := range sessions {
		if !environmentIDs[session.EnvironmentID] {
			t.Fatalf("session %s references unknown environment %s", session.ID, session.EnvironmentID)
		}
	}
}

func TestSeedMemoryStoresMatchesSourceCreatedLabels(t *testing.T) {
	stores, _ := seedMemoryStores(time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC))

	want := map[string]string{
		"memstore_01TFhvAtMizQJLWU29TaW5AZ": "7 days ago",
		"memstore_01GYUDt8DBmRPDfhs5i9in8M": "Jun 16",
		"memstore_01GToktzJyefFL2DVxmgyT5e": "Jun 16",
		"memstore_014LoF1P4MoTKK9HYDmacJuB": "Jun 16",
	}
	for _, store := range stores {
		if label, ok := want[store.ID]; ok && store.CreatedLabel != label {
			t.Fatalf("memory store %s created label = %q, want %q", store.ID, store.CreatedLabel, label)
		}
	}
}

func TestSeedMemoryRecordsMatchReferenceDetail(t *testing.T) {
	_, memories := seedMemoryStores(time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC))

	for _, memory := range memories {
		if memory.ID != "mem_01VZ3WZtoGtAg3kogjFYzCmu" {
			continue
		}
		if memory.Path != "/test123" {
			t.Fatalf("memory path = %q, want %q", memory.Path, "/test123")
		}
		if memory.DisplayName != "" {
			t.Fatalf("memory display name = %q, want empty", memory.DisplayName)
		}
		if memory.Content != "123" {
			t.Fatalf("memory content = %q, want %q", memory.Content, "123")
		}
		if memory.UpdatedLabel != "Jun 16" {
			t.Fatalf("memory updated label = %q, want %q", memory.UpdatedLabel, "Jun 16")
		}
		return
	}
	t.Fatalf("reference memory record was not seeded")
}
