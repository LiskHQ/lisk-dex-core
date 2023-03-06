/*
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

import { PoSEndpoint } from 'lisk-framework/dist-node/modules/pos/endpoint';
import {
	BaseCommand,
	BaseModule,
	ModuleInitArgs,
	ModuleMetadata,
	PoSMethod,
	TokenMethod,
	utils,
} from 'lisk-sdk';
import { ModuleConfig } from '../dex/types';
import { VoteOnPorposalCommand } from './commands/voteOnPorposal';
import { defaultConfig } from './constants';

import { DexGovernanceEndpoint } from './endpoint';
import {
	ProposalCreatedEvent,
	ProposalCreationFailedEvent,
	ProposalOutcomeCheckedEvent,
	ProposalQuorumCheckedEvent,
	ProposalVotedEvent,
} from './events';

import { DexGovernanceMethod } from './method';
import {
	getIndexStoreResponseSchema,
	getProposalRequestSchema,
	getProposalResponseSchema,
	getUserVotesRequestSchema,
	getUserVotesResponseSchema,
	indexSchema,
	proposalSchema,
	votesSchema,
} from './schemas';
import { IndexStore, ProposalsStore, VotesStore } from './stores';

export class DexGovernanceModule extends BaseModule {
	public endpoint = new DexGovernanceEndpoint(this.stores, this.offchainStores);
	public method = new DexGovernanceMethod(this.stores, this.events);
	public _tokenMethod!: TokenMethod;
	public _posMethod!: PoSMethod;
	public _moduleConfig!: ModuleConfig;
	public _posEndpoint!: PoSEndpoint;
	public _methodContext!: PoSEndpoint;

	private readonly __voteOnPorposalCommand = new VoteOnPorposalCommand(this.stores, this.events);

	public commands = [this.__voteOnPorposalCommand];

	public constructor() {
		super();
		this.stores.register(IndexStore, new IndexStore(this.name));
		this.stores.register(ProposalsStore, new ProposalsStore(this.name));
		this.stores.register(VotesStore, new VotesStore(this.name));
		this.events.register(ProposalCreatedEvent, new ProposalCreatedEvent(this.name));
		this.events.register(ProposalCreationFailedEvent, new ProposalCreationFailedEvent(this.name));
		this.events.register(ProposalOutcomeCheckedEvent, new ProposalOutcomeCheckedEvent(this.name));
		this.events.register(ProposalQuorumCheckedEvent, new ProposalQuorumCheckedEvent(this.name));
		this.events.register(ProposalVotedEvent, new ProposalVotedEvent(this.name));
	}

	public metadata(): ModuleMetadata {
		return {
			stores: [
				{
					key: 'IndexStore',
					data: indexSchema,
				},
				{
					key: 'ProposalsStore',
					data: proposalSchema,
				},
				{
					key: 'VotesStore',
					data: votesSchema,
				},
			],
			endpoints: [
				{
					name: this.endpoint.getProposal.name,
					request: getProposalRequestSchema,
					response: getProposalResponseSchema,
				},
				{
					name: this.endpoint.getUserVotes.name,
					request: getUserVotesRequestSchema,
					response: getUserVotesResponseSchema,
				},
				{
					name: this.endpoint.getIndexStore.name,
					response: getIndexStoreResponseSchema,
				},
			],
			commands: this.commands.map((command: BaseCommand) => ({
				name: command.name,
				params: command.schema,
			})),
			events: this.events.values().map(v => ({
				name: v.name,
				data: v.schema,
			})),
			assets: [],
		};
	}

	public addDependencies(tokenMethod: TokenMethod, posMethod: PoSMethod) {
		this._tokenMethod = tokenMethod;
		this._posMethod = posMethod;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { moduleConfig } = args;
		this._moduleConfig = utils.objects.mergeDeep({}, defaultConfig, moduleConfig) as ModuleConfig;

		this.__voteOnPorposalCommand.init({
			posEndpoint: this._posEndpoint,
			methodContext: this._methodContext,
		});
	}
}
