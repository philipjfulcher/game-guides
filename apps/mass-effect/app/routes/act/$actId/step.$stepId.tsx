import {ActionFunction, Form, json, LoaderFunction, useLoaderData} from 'remix';
import {getAct, getStep, Step} from '~/data/data-steps';
import {Fragment} from "react";
import prisma from "~/data/db";

export let loader: LoaderFunction = async ({params, request}) => {
    const step = await getStep(params.actId as string, params.stepId as string, true);


    return json(step);
};

export let action: ActionFunction = async ({request}) => {
    const formData = await request.formData();

    const stepId = formData.get('stepId')
    const actId = formData.get('actId');

    if (stepId && actId) {
        await prisma.completedStep.create({data: {stepId: stepId.toString(), actId: actId.toString()}});
    }

    return null;
}

export default function Step() {
    let step = useLoaderData< Step >();
    return <>
        <div dangerouslySetInnerHTML={{__html: step.contentHtml}}></div>
        {step.substeps.map(substep => (<Fragment key={substep.id}>
            <h4>{substep.title}</h4>
            <h5>{substep.id}</h5>
            <div dangerouslySetInnerHTML={{__html: substep.contentHtml}}></div>
            {substep.completed ? <h5>Completed</h5> :
                <Form method="post">
                    <input type="hidden" name="actId" value={substep.actId}></input>
                    <input type="hidden" name="stepId" value={substep.id}></input>
                    <button>Mark complete</button>
                </Form>
            }</Fragment>))}
        {step.completed ? <h5>Completed</h5> : step.substeps.filter(substep => !substep.completed).length === 0 ?
            <Form method="post">
                <input type="hidden" name="actId" value={step.actId}></input>
                <input type="hidden" name="stepId" value={step.id}></input>
                <button>Mark complete</button>
            </Form> : <small>Complete all substeps to continue</small>
        }
    </>;

}
