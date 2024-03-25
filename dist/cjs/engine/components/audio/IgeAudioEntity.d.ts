import { IgeEntity } from "../../core/IgeEntity.js"
import type { IgeAudioPlaybackOptions } from "../../../types/IgeAudioPlaybackOptions.js"
export declare const defaultPannerSettings: PannerOptions;
export interface IgeAudioEntityProps extends IgeAudioPlaybackOptions {
    audioId?: string;
    playOnMount?: boolean;
}
/**
 * Creates an audio entity that automatically handles
 * controlling panning / positioning of sound based on
 * where it is located on the screen in relation to
 * the listener / player. Also supports entity streaming
 * so an IgeAudioEntity can be instantiated server-side
 * and then be synced over the network to clients.
 *
 * If you only want to play audio and don't need to
 * position it in the simulation, an IgeAudioEntity is
 * overkill. You can use an IgeAudioControl instance instead.
 * The IgeAudioEntity uses an IgeAudioControl under the
 * hood anyway. This class is also designed for persistent
 * sound sources rather than incidental ones. If you are
 * looking to create incidental sound at a location you
 * can call the ige.audio.play() function instead.
 *
 * @see IgeAudioController.play()
 */
export declare class IgeAudioEntity extends IgeEntity {
    classId: string;
    _isPlaying: boolean;
    _playOnMount: boolean;
    _loop: boolean;
    _volume: number;
    _pannerSettings: PannerOptions;
    _relativeTo?: IgeEntity | string;
    _panner?: PannerNode;
    _audioSourceId?: string;
    _playbackControlId?: string;
    constructor(props?: IgeAudioEntityProps);
    /**
     * Returns the data sent to each client when the entity
     * is created via the network stream.
     */
    streamCreateConstructorArgs(): [IgeAudioEntityProps];
    onStreamProperty(propName: string, propVal: any): this;
    playOnMount(): boolean;
    playOnMount(val: boolean): this;
    pannerSettings(): PannerOptions;
    pannerSettings(val: PannerOptions): this;
    relativeTo(): IgeEntity | string | undefined;
    relativeTo(val: IgeEntity | string): this;
    /**
     * Gets the playing state.
     * @returns {boolean} True if playing, false if not.
     */
    isPlaying(): boolean;
    /**
     * Gets / sets the id of the audio stream to use for playback.
     * @param {string} [id] The audio id. Must match
     * a previously registered audio stream that was
     * registered via `ige.engine.audio.register()`.
     * The audio component must be active in the engine to
     * use this service via `ige.uses("audio");`.
     * @returns {*}
     */
    audioSourceId(): string | undefined;
    audioSourceId(val: string): this;
    volume(val?: number): number | this;
    loop(val?: boolean): boolean | this;
    /**
     * Starts playback of the audio.
     * @returns {IgeAudioEntity}
     */
    play(): this | null;
    /**
     * Stops playback of the audio.
     * @returns {IgeAudioEntity}
     */
    stop(): this;
    update(tickDelta: number): void;
    /**
     * Called when the entity is to be destroyed. Stops any
     * current audio stream playback.
     */
    destroy(): this;
    _mounted(obj: IgeEntity): void;
    _unMounted(obj: IgeEntity): void;
}
