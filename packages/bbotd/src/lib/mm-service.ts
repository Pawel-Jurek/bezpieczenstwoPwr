import * as tf from "@tensorflow/tfjs";

/**
 * Represents raw mouse movement data collected from the browser
 */
interface RawMouseData {
  x: number;
  y: number;
  timestamp: number;
  sessionId: string;
}

/**
 * Processed mouse movement data with calculated differences
 */
interface ProcessedMouseData {
  x_diff: number;
  y_diff: number;
  timestamp: number;
  sessionId: string;
}

/**
 * Features extracted from mouse movement patterns for ML prediction
 */
interface MouseMovementFeatures {
  x_diff_mean: number;
  x_diff_std: number;
  x_diff_sum: number;
  y_diff_mean: number;
  y_diff_std: number;
  y_diff_sum: number;
  xy_total_activity: number;
  xy_std_total: number;
  xy_mean_total: number;
}

/**
 * Prediction result with confidence analysis
 */
interface BotDetectionResult {
  botProbability: number; // Raw probability (0-1)
  confidencePercentage: number; // Percentage (0-100)
  predictionLabel: "Bot" | "Human";
  confidenceLevel: "Very High" | "High" | "Moderate" | "Low";
  isDefinitive: boolean; // Whether we can trust this prediction
}

/**
 * Configuration for the mouse bot detection service
 */
interface DetectionConfig {
  minWindowDuration: number; // Minimum time window in milliseconds
  maxWindowDuration: number; // Maximum time window in milliseconds
  confidenceThreshold: number; // Threshold for definitive bot classification
  modelPath: string; // Path to the TensorFlow.js model
  scalerConfig: ScalerConfig; // Normalization parameters from Python training
}

/**
 * Scaler configuration to match Python's MinMaxScaler
 * These values come from your Python training process
 */
interface ScalerConfig {
  featureMin: number[]; // Minimum values for each feature
  featureMax: number[]; // Maximum values for each feature
  dataMin: number[]; // Data minimums from training
  dataMax: number[]; // Data maximums from training
  scale: number[]; // Scaling factors for each feature
}

/**
 * Mouse Bot Detection Service
 *
 * This service handles the complete pipeline from raw mouse movements
 * to bot detection predictions, mirroring your Python implementation
 * but optimized for browser environments.
 */
export class MouseBotDetectionService {
  private model: tf.LayersModel | null = null;
  private config: DetectionConfig;
  private isInitialized = false;

  constructor(config: DetectionConfig) {
    this.config = config;
  }

  /**
   * Initialize the service by loading the TensorFlow.js model
   * This should be called once when your application starts
   */
  async initialize(): Promise<void> {
    try {
      console.log("Loading mouse bot detection model...");

      // Load the converted TensorFlow.js model
      // Note: You'll need to convert your Python model to TensorFlow.js format
      this.model = await tf.loadLayersModel(this.config.modelPath);

      this.isInitialized = true;
      console.log("Mouse bot detection model loaded successfully");

      // Warm up the model with a dummy prediction to ensure it's ready
      await this.warmUpModel();
    } catch (error) {
      console.error("Failed to initialize mouse bot detection service:", error);
      throw new Error(`Model initialization failed: ${error}`);
    }
  }

  /**
   * Warm up the model by running a dummy prediction
   * This ensures the first real prediction isn't slow due to model initialization
   */
  private async warmUpModel(): Promise<void> {
    if (!this.model) return;

    // Create dummy features matching your feature structure
    const dummyFeatures = new Array(9).fill(0.5); // 9 features as per your Python code
    const dummyTensor = tf.tensor2d([dummyFeatures], [1, 9]);

    try {
      const prediction = this.model.predict(dummyTensor) as tf.Tensor;
      prediction.dispose(); // Clean up memory
      dummyTensor.dispose();
      console.log("Model warm-up completed");
    } catch (error) {
      console.warn("Model warm-up failed, but continuing:", error);
    }
  }

  /**
   * Process raw mouse movement data to calculate movement differences
   * This replicates the preprocessing step from your Python code
   */
  private processRawMouseData(rawData: RawMouseData[]): ProcessedMouseData[] {
    if (rawData.length < 2) return [];

    const processed: ProcessedMouseData[] = [];

    // Sort by timestamp to ensure chronological order
    const sortedData = [...rawData].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate differences between consecutive mouse positions
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i]!;
      const previous = sortedData[i - 1]!;

      // Only process if they're from the same session
      if (current.sessionId === previous.sessionId) {
        processed.push({
          x_diff: Math.abs(current.x - previous.x), // Absolute difference like in Python
          y_diff: Math.abs(current.y - previous.y),
          timestamp: current.timestamp,
          sessionId: current.sessionId,
        });
      }
    }

    return processed;
  }

  /**
   * Extract statistical features from processed mouse movement data
   * This mirrors the feature engineering logic from your Python implementation
   */
  private extractFeatures(
    processedData: ProcessedMouseData[]
  ): MouseMovementFeatures | null {
    if (processedData.length === 0) return null;

    // Calculate basic statistics for x and y movements
    const xDiffs = processedData.map((d) => d.x_diff);
    const yDiffs = processedData.map((d) => d.y_diff);

    // Statistical calculations
    const xMean = this.calculateMean(xDiffs);
    const yMean = this.calculateMean(yDiffs);
    const xStd = this.calculateStandardDeviation(xDiffs, xMean);
    const yStd = this.calculateStandardDeviation(yDiffs, yMean);
    const xSum = xDiffs.reduce((sum, val) => sum + val, 0);
    const ySum = yDiffs.reduce((sum, val) => sum + val, 0);

    // Composite features matching your Python implementation
    const features: MouseMovementFeatures = {
      x_diff_mean: xMean,
      x_diff_std: xStd,
      x_diff_sum: xSum,
      y_diff_mean: yMean,
      y_diff_std: yStd,
      y_diff_sum: ySum,
      xy_total_activity: xSum + ySum,
      xy_std_total: xStd + yStd,
      xy_mean_total: xMean + yMean,
    };

    return features;
  }

  /**
   * Scale features using the same MinMaxScaler parameters from Python training
   * This is crucial for maintaining prediction accuracy
   */
  private scaleFeatures(features: MouseMovementFeatures): number[] {
    const featureArray = [
      features.x_diff_mean,
      features.x_diff_std,
      features.x_diff_sum,
      features.y_diff_mean,
      features.y_diff_std,
      features.y_diff_sum,
      features.xy_total_activity,
      features.xy_std_total,
      features.xy_mean_total,
    ];

    // Apply MinMaxScaler transformation: (X - min) / (max - min)
    const scaledFeatures = featureArray.map((value, index) => {
      const min = this.config.scalerConfig.dataMin[index]!;
      const max = this.config.scalerConfig.dataMax[index]!;

      // Handle edge case where min === max (constant feature)
      if (max === min) return 0.0;

      return (value - min) / (max - min);
    });

    return scaledFeatures;
  }

  /**
   * Convert raw model prediction to user-friendly result
   */
  private interpretPrediction(rawProbability: number): BotDetectionResult {
    const confidencePercentage = rawProbability * 100;
    const predictionLabel: "Bot" | "Human" =
      rawProbability > 0.5 ? "Bot" : "Human";

    // Determine confidence level based on how far the prediction is from 0.5
    let confidenceLevel: "Very High" | "High" | "Moderate" | "Low";
    if (confidencePercentage >= 90 || confidencePercentage <= 10) {
      confidenceLevel = "Very High";
    } else if (confidencePercentage >= 75 || confidencePercentage <= 25) {
      confidenceLevel = "High";
    } else if (confidencePercentage >= 60 || confidencePercentage <= 40) {
      confidenceLevel = "Moderate";
    } else {
      confidenceLevel = "Low";
    }

    const isDefinitive =
      confidencePercentage >= this.config.confidenceThreshold ||
      confidencePercentage <= 100 - this.config.confidenceThreshold;

    return {
      botProbability: rawProbability,
      confidencePercentage,
      predictionLabel,
      confidenceLevel,
      isDefinitive,
    };
  }

  /**
   * Main prediction method - analyzes mouse movement data and returns bot detection result
   * This is your primary interface for getting predictions from collected mouse data
   */
  async predictBotBehavior(
    rawMouseData: RawMouseData[]
  ): Promise<BotDetectionResult | null> {
    if (!this.isInitialized || !this.model) {
      throw new Error("Service not initialized. Call initialize() first.");
    }

    if (rawMouseData.length < 10) {
      console.warn("Insufficient mouse data for reliable prediction");
      return null;
    }

    try {
      // Step 1: Process raw mouse movements to calculate differences
      const processedData = this.processRawMouseData(rawMouseData);

      if (processedData.length === 0) {
        console.warn("No valid mouse movement differences calculated");
        return null;
      }

      // Step 2: Extract statistical features from the movement patterns
      const features = this.extractFeatures(processedData);

      if (!features) {
        console.warn("Feature extraction failed");
        return null;
      }

      // Step 3: Scale features using the same parameters from Python training
      const scaledFeatures = this.scaleFeatures(features);

      // Step 4: Create tensor for model prediction
      const inputTensor = tf.tensor2d(
        [scaledFeatures],
        [1, scaledFeatures.length]
      );

      // Step 5: Get prediction from the neural network
      const predictionTensor = this.model.predict(inputTensor) as tf.Tensor;
      const predictionArray = await predictionTensor.data();
      const rawProbability = predictionArray[0]!;

      // Step 6: Clean up tensors to prevent memory leaks
      inputTensor.dispose();
      predictionTensor.dispose();

      // Step 7: Convert raw prediction to meaningful result
      return this.interpretPrediction(rawProbability);
    } catch (error) {
      console.error("Prediction failed:", error);
      throw new Error(`Bot detection prediction failed: ${error}`);
    }
  }

  /**
   * Utility method to calculate mean of an array
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Utility method to calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean?: number): number {
    if (values.length === 0) return 0;

    const actualMean = mean ?? this.calculateMean(values);
    const squaredDifferences = values.map((val) =>
      Math.pow(val - actualMean, 2)
    );
    const variance = this.calculateMean(squaredDifferences);

    return Math.sqrt(variance);
  }

  /**
   * Clean up resources when the service is no longer needed
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
  }
}

/**
 * Factory function to create and initialize the mouse bot detection service
 * This is the recommended way to create the service in your application
 */
export async function createMouseBotDetectionService(
  modelPath: string,
  scalerConfig: ScalerConfig,
  options: Partial<Omit<DetectionConfig, "modelPath" | "scalerConfig">> = {}
): Promise<MouseBotDetectionService> {
  const config: DetectionConfig = {
    minWindowDuration: options.minWindowDuration ?? 6000, // 6 seconds
    maxWindowDuration: options.maxWindowDuration ?? 12000, // 12 seconds
    confidenceThreshold: options.confidenceThreshold ?? 80, // 80% confidence
    modelPath,
    scalerConfig,
  };

  const service = new MouseBotDetectionService(config);
  await service.initialize();

  return service;
}

/**
 * Example usage and integration helper
 */
export class MouseDataCollector {
  private mouseData: RawMouseData[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupMouseListeners();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupMouseListeners(): void {
    document.addEventListener("mousemove", (event) => {
      this.mouseData.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
        sessionId: this.sessionId,
      });

      // Keep only recent data to prevent memory issues
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      this.mouseData = this.mouseData.filter(
        (data) => data.timestamp > fiveMinutesAgo
      );
    });
  }

  getMouseData(): RawMouseData[] {
    return [...this.mouseData]; // Return a copy
  }

  clearData(): void {
    this.mouseData = [];
  }

  startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.clearData();
  }
}
