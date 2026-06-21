package main

import (
	"testing"
	"time"
)

func TestSeedSessionsMatchesSourceCreatedLabels(t *testing.T) {
	sessions, _ := seedSessions(time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC))

	want := map[string]string{
		"sesn_01MwRxWt4Enabbz8a2Vk66M7":  "Jun 18",
		"sesn_01DpRMTNY1P3gNrELQEXitXN": "Jun 18",
	}
	for _, session := range sessions {
		if label, ok := want[session.ID]; ok && session.CreatedLabel != label {
			t.Fatalf("session %s created label = %q, want %q", session.ID, session.CreatedLabel, label)
		}
	}
}
