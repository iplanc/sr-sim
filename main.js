class Sim {
    // 构建器，用于触发运算
    constructor(statement) {
        console.log("Phase: constructor with statement");
        console.log(statement);
        this.start(statement);
    };

    // 计算任务控制器
    start(statement) {
        this.execRound(statement, 1);
        console.log("Phase: Simulation ended");
    }

    // 回合触发器
    execRound(statement, round) {
        if (round == 2 + 1) return console.log("Maximum round reached");

        console.group("Round: " + round);

        // 根据速度排列时间轴
        var timeline = statement.friendly.concat(statement.hostile);
        var timeline = timeline.sort(
            function(a, b) {
                return b.status.spd - a.status.spd
            }
        );

        // 根据时间轴开始行动
        timeline.forEach(character => {
            var hostiles = timeline.filter(
                function(obj) {
                    return obj.friendly == !character.friendly
                }
            ).sort(
                function(a, b) {
                    return b.status.wek.includes(character.nature) - a.status.wek.includes(character.nature)
                }
            );
            if (character.friendly == true) {
                // 友方攻击
                if (character.status.currentMP == character.status.maxMP) {
                    // 施放终结技
                    character.ultimate();
                }
                if (statement.params.skillPoints > 0) {
                    // 如果技能无施放条件
                    if (character.skill() == -1) {
                        // 普攻
                        hostiles[0] = this.attack(character, hostiles[0]);
                        statement.params.skillPoints = Math.min(statement.params.skillPoints + 1, 5);
                    }
                }
                else {
                    // 如果无战技点
                    // 普攻
                    hostiles[0] = this.attack(character, hostiles[0]);
                    statement.params.skillPoints = Math.min(statement.params.skillPoints + 1, 5);
                }
            }
            else {
                // 敌方攻击
                var randomNum = Math.floor(Math.random() * 4);
                hostiles[randomNum] = this.attack(character, hostiles[randomNum]);
            }
            // console.log(timeline);
        });
        console.groupEnd();
        this.execRound(statement, round + 1);
    }

    attack(attacker, defender, width = 1) {
        var amount = attacker.status.atk;
        if (attacker.buffs != undefined) {
            // 循环结算攻击力buff加成
            attacker.buffs.forEach(buff => {
                amount = amount + buff.buff("atk", attacker.status.atk);
                buff.duration = buff.duration - 1
            });
        }
        defender.status.hp = defender.status.hp - amount;
        this.battleLog(attacker, defender, amount);
        return defender;
    }

    battleLog(attacker, defender, amount) {
        console.log(attacker.name + " delt " + amount + " to " + defender.name);
    }
}