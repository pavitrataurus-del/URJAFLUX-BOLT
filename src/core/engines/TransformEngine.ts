import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { Point2D } from '../spatial/math';
import { USOMId } from '../usom/types';
import { ObjectEngine } from './ObjectEngine';
import { CommandEngine } from '../commands/CommandEngine';
import { TranslateCommand, RotateCommand, ScaleCommand } from '../commands/TransformCommands';

export class TransformEngine implements BaseEngine {
  public readonly name = 'TransformEngine';
  private initialized = false;

  constructor(
    private objectEngine: ObjectEngine,
    private commandEngine: CommandEngine
  ) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public async translate(objectId: USOMId, delta: Point2D): Promise<void> {
    if (!this.initialized) return;
    const command = new TranslateCommand(objectId, delta);
    await this.commandEngine.execute(command, this.objectEngine);
  }

  public async rotate(objectId: USOMId, deltaAngleDegrees: number): Promise<void> {
    if (!this.initialized) return;
    const command = new RotateCommand(objectId, deltaAngleDegrees);
    await this.commandEngine.execute(command, this.objectEngine);
  }

  public async scale(objectId: USOMId, scaleFactor: Point2D): Promise<void> {
    if (!this.initialized) return;
    const command = new ScaleCommand(objectId, scaleFactor);
    await this.commandEngine.execute(command, this.objectEngine);
  }
}
