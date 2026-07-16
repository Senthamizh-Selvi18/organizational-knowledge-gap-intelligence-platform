package com.organizational.knowledge_gap_platform.entity;

public enum ProficiencyLevel {
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3),
    EXPERT(4);

    private final int rank;

    ProficiencyLevel(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }
}
