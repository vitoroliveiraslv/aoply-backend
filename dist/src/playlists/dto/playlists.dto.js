"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderPlaylistDto = exports.ReorderItemDto = exports.CreatePlaylistDto = exports.PlaylistItemInputDto = exports.InterleaveRulesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class InterleaveRulesDto {
    type;
    youtubeFrequency;
    timeMinutesInterval;
    adGroupId;
}
exports.InterleaveRulesDto = InterleaveRulesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InterleaveRulesDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], InterleaveRulesDto.prototype, "youtubeFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], InterleaveRulesDto.prototype, "timeMinutesInterval", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InterleaveRulesDto.prototype, "adGroupId", void 0);
class PlaylistItemInputDto {
    assetId;
    position;
    category;
    customDurationSeconds;
    isMuted;
}
exports.PlaylistItemInputDto = PlaylistItemInputDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaylistItemInputDto.prototype, "assetId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaylistItemInputDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaylistItemInputDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PlaylistItemInputDto.prototype, "customDurationSeconds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlaylistItemInputDto.prototype, "isMuted", void 0);
class CreatePlaylistDto {
    name;
    description;
    organizationId;
    interleaveRules;
    items;
}
exports.CreatePlaylistDto = CreatePlaylistDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlaylistDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlaylistDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlaylistDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", InterleaveRulesDto)
], CreatePlaylistDto.prototype, "interleaveRules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlaylistItemInputDto),
    __metadata("design:type", Array)
], CreatePlaylistDto.prototype, "items", void 0);
class ReorderItemDto {
    itemId;
    newPosition;
}
exports.ReorderItemDto = ReorderItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReorderItemDto.prototype, "itemId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReorderItemDto.prototype, "newPosition", void 0);
class ReorderPlaylistDto {
    orders;
}
exports.ReorderPlaylistDto = ReorderPlaylistDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReorderItemDto),
    __metadata("design:type", Array)
], ReorderPlaylistDto.prototype, "orders", void 0);
//# sourceMappingURL=playlists.dto.js.map