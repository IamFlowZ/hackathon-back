import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

const containerProps = {
  ourApp: {
    "imageUrl": "",
    "containerPort": 8000,
    "environment": {
    }
  }
}
export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    // TODO spin up db
    super(scope, id, props);

    // target vpc to deploy into
    const defaultVpc = ec2.Vpc.fromLookup(this, "defaultVpc", {
      isDefault: true,
    });

    // cluster to house everything
    const cluster = new ecs.Cluster(this, "ebosCluster", {
      vpc: defaultVpc,
    });

    const taskExecRole = new iam.Role(this, "ecsExecRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "ecsExecutionPolicy",
          "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
        ),
      ],
    });

    // combine service params along with the target task def
    const propsAndTaskDef = Object.entries(containerProps).reduce(
      (accu, [containerKey, containerEnv]) => {
        accu[containerKey] = {
          ...containerEnv,
          serviceName: containerKey,
          taskDefinition: new ecs.FargateTaskDefinition(this, `${containerKey}TaskDef`, {
            memoryLimitMiB: 512,
            cpu: 256,
            executionRole: taskExecRole,
          }),
        };
        return accu;
      },
      {} as { [k: string]: any }
    );

    // add containers and the managing service
    const taskDefWithContainers = Object.entries(propsAndTaskDef).reduce(
      (accu, [containerKey, containerValues]) => {
        accu[containerKey] = {
          ...containerValues,
          container: new ecs.ContainerDefinition(scope, `container`, {
            image: ecs.ContainerImage.fromRegistry(''),
            taskDefinition: containerValues.taskDefinition,
            portMappings: [{ containerPort: 8000 }],
            environment: {},
          }),
          service: new ecs.FargateService(this, `${containerKey}Service`, {
            cluster,
            taskDefinition: containerValues.taskDefinition,
            assignPublicIp: true,
          })
        }
        return accu;
      },
      {} as { [k: string]: any }
    )

    // combine outward facing networking with previous work
    const servicesWithContainersAndLbs = Object.entries(taskDefWithContainers).reduce(
      (accu, [containerKey, containerValues]) => {
        const { service } = containerValues;

        // networking configuration for routing traffic to containers
        const lb = new elbv2.ApplicationLoadBalancer(this, `${containerKey}LB`, {
          vpc: defaultVpc,
          internetFacing: true,
          vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC,
            onePerAz: true,
          },
        });

        const listener = lb.addListener(`${containerKey}Listener`, { port: 80 });
        service.registerLoadBalancerTargets({
          containerName: containerValues.container.containerName,
          containerPort: containerValues.containerPort,
          newTargetGroupId: `${containerKey}TargetGroup`,
          listener: ecs.ListenerConfig.applicationListener(listener, {
            protocol: elbv2.ApplicationProtocol.HTTP,
            healthCheck: {
              path: '/alive'
            }
          }),
        });

        accu[containerKey] = {
          ...containerValues,
        }
        return accu;
      }, 
    {} as { [k: string]: any })
  }
}