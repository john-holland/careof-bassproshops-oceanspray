-- CreateTable
CREATE TABLE "SensorReading" (
    "id" SERIAL NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "location_x" DOUBLE PRECISION NOT NULL,
    "location_y" DOUBLE PRECISION NOT NULL,
    "location_z" DOUBLE PRECISION NOT NULL,
    "orientation" TEXT,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentChange" (
    "id" SERIAL NOT NULL,
    "tank_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_temporary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrentChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingSchedule" (
    "id" SERIAL NOT NULL,
    "tank_id" INTEGER NOT NULL,
    "species" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "last_fed" TIMESTAMP(3) NOT NULL,
    "next_feeding" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" SERIAL NOT NULL,
    "tank_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "species" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensorReading_sensor_id_idx" ON "SensorReading"("sensor_id");

-- CreateIndex
CREATE INDEX "SensorReading_timestamp_idx" ON "SensorReading"("timestamp");

-- CreateIndex
CREATE INDEX "CurrentChange_tank_id_idx" ON "CurrentChange"("tank_id");

-- CreateIndex
CREATE INDEX "CurrentChange_timestamp_idx" ON "CurrentChange"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "FeedingSchedule_tank_id_species_key" ON "FeedingSchedule"("tank_id", "species");

-- CreateIndex
CREATE INDEX "FeedingSchedule_tank_id_idx" ON "FeedingSchedule"("tank_id");

-- CreateIndex
CREATE INDEX "FeedingSchedule_next_feeding_idx" ON "FeedingSchedule"("next_feeding");

-- CreateIndex
CREATE INDEX "HealthCheck_tank_id_idx" ON "HealthCheck"("tank_id");

-- CreateIndex
CREATE INDEX "HealthCheck_timestamp_idx" ON "HealthCheck"("timestamp");

-- CreateIndex
CREATE INDEX "HealthCheck_status_idx" ON "HealthCheck"("status"); 