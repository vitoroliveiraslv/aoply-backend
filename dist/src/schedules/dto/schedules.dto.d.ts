export declare class ScheduleRuleInputDto {
    playlistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    priority?: number;
}
export declare class CreateScheduleDto {
    name: string;
    timezone?: string;
    organizationId?: string;
    rules?: ScheduleRuleInputDto[];
}
export declare class UpdateScheduleRulesDto {
    rules: ScheduleRuleInputDto[];
}
