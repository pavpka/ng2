import { guid } from 'ng2-qgrid/core/services/guid';
import { isFunction } from 'ng2-qgrid/core/utility/index';
import { Expression, GroupExpression } from './expression';
import { nodeSchema, INodeSchema } from './node.schema';
import { GroupSchema } from './group.schema';
import * as utility from '../utility';
import * as patch from '../patch';
import { Node } from './node';
import { Line } from './line';
import { IStatement, EmptyStatement } from './statement';


export class ExpressionBuilder {
	constructor(private settings) {
	}

	build<T>(statements: Array<IStatement>): T {
		const NodeSchemaT = nodeSchema(GroupSchema);

		statements
			.concat([new EmptyStatement()])
			.forEach(statement => {
				const factory = function (...args) {
					let id = guid();
					let expression: Expression;
					if (args.length > 1) {
						id = args[0];
						expression = args[1];
					} else if (args.length === 1) {
						expression = args[0];
					}

					const build = function (node: Node, line: Line) {
						expression =
							utility.defaults<Expression>(
								expression,
								statement.defaults,
								this.settings.defaults
							);

						expression.id = id;
						expression.type = statement.type;

						const group = new GroupExpression();
						group.id = id;
						group.expressions.push(expression);
						expression.templateUrl = statement.templateKey;
						line.add(group);

						patch.methodsOf(expression).with(node, line);

						const keys = Object.keys(expression);

						keys.forEach(key => {
							const sourceFunction = expression[key];

							if (isFunction(sourceFunction)) {
								expression[key] = (...args) => {
									const result = sourceFunction.apply(expression, args);

									// TODO add decorator for muttable methods instead of trigger
									if (!line.immutable) {
										expression.method = expression.method || [];
										if (expression.method.indexOf(key) < 0) {
											expression.method.push(key);
										}

										line.immutable = true;
									}
									return result;
								};
							}
						});

						return node;
					};

					this.plan.push(build);
					this.planMap[id] = build;

					return this;
				};

				const groupFactory = function (...args) {
					let id = guid();
					let expression: Expression;
					if (args.length > 1) {
						id = args[0];
						expression = args[1];
					} else if (args.length === 1) {
						expression = args[0];
					}

					const build = function (node, line, expressionGroup) {
						expression = utility.defaults<Expression>(expression, statement.defaults, this.settings.defaults);
						expression.id = id;
						expression.type = statement.type;
						expression.templateUrl = statement.templateKey;
						expressionGroup.expressions.push(expression);

						patch.methodsOf(expression).with(node, line);

						return node;
					};

					this.plan.push(build);

					return this;
				};

				NodeSchemaT.prototype[statement.type] = factory;
				GroupSchema.prototype[statement.type] = groupFactory;
			});

		// TODO: think how to avoid this
		return new NodeSchemaT() as any as T;
	}
}
